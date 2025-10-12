const getUploadMiddleware = require('../infrastructure/upload');
const { FileUploadDTO, FileResponseDTO } = require('../dto/FileDTO');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class FileUploadController {
  
  async uploadFiles(req, res) {
    try {
      const upload = getUploadMiddleware({ subDir: 'assets' });
      const uploadSingle = upload.array('files', 10); // Allow up to 10 files

      uploadSingle(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: 'File upload failed',
            error: err.message
          });
        }

        try {
          const fileUploadDTO = new FileUploadDTO({
            type: req.body.type || 'notice-attachment',
            files: req.files || []
          });

          const validation = fileUploadDTO.validate();
          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              message: 'Validation failed',
              errors: validation.errors
            });
          }

          const uploads = req.files.map(file => {
            // Extract UUID from filename (first part before the first dash)
            const fileId = file.filename.split('-')[0];
            const fileData = {
              id: fileId,
              fileName: file.filename,
              originalName: file.originalname,
              fileSize: file.size,
              mimeType: file.mimetype,
              filePath: file.path,
              url: this.generateFileUrl(file),
              uploadedAt: new Date().toISOString()
            };

            return new FileResponseDTO(fileData);
          });

          res.status(200).json({
            success: true,
            data: {
              uploads
            },
            message: `${uploads.length} file(s) uploaded successfully`
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'File processing failed',
            error: error.message
          });
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Upload initialization failed',
        error: error.message
      });
    }
  }

  async downloadFile(req, res) {
    try {
      const { fileId } = req.params;
      
      // For now, we'll implement a basic version that searches for files
      // In a real implementation, you would store file metadata in database
      const filePath = await this.findFileById(fileId);
      
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on disk'
        });
      }

      // Set appropriate headers
      const fileName = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      
      // Determine content type
      const ext = path.extname(fileName).toLowerCase();
      const contentTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.txt': 'text/plain',
        '.csv': 'text/csv'
      };
      
      if (contentTypes[ext]) {
        res.setHeader('Content-Type', contentTypes[ext]);
      }
      
      // Stream the file
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        success: false,
        message: 'File download failed',
        error: error.message
      });
    }
  }

  async deleteFile(req, res) {
    try {
      const { fileId } = req.params;
      
      // Here you would typically:
      // 1. Find the file record in database
      // 2. Check permissions
      // 3. Delete the file from storage
      // 4. Remove the database record
      
      const filePath = this.getFilePathById(fileId);
      
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Delete from disk
      const fs = require('fs');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'File deletion failed',
        error: error.message
      });
    }
  }

  generateFileUrl(file) {
    // Generate URL based on upload driver
    if (process.env.UPLOAD_DRIVER === 's3') {
      // For S3, the location is already a URL
      return file.location || file.key;
    } else {
      // For local storage, generate a relative URL
      const relativePath = file.path.replace(/\\/g, '/');
      const baseUrl = process.env.CDN_URL || 'http://localhost:3000';
      
      // Extract the path components: userId/subDir/filename
      const pathSegments = relativePath.split('/');
      const fileName = pathSegments[pathSegments.length - 1]; // Last segment is filename
      const subDir = pathSegments[pathSegments.length - 2]; // Second to last is subDir
      const userId = pathSegments[pathSegments.length - 3]; // Third to last is userId
      
      return `${baseUrl}/uploads/${userId}/${subDir}/${fileName}`;
    }
  }

  async findFileById(fileId) {
    const fs = require('fs');
    
    // First, try to find by database ID using Prisma
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Look for NoticeAttachment with this ID
      const attachment = await prisma.noticeAttachment.findUnique({
        where: { id: fileId }
      });
      
      if (attachment && attachment.fileName) {
        console.log('Found attachment in database:', attachment.fileName);
        
        // Use the same path logic as upload middleware
        const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';
        let uploadsDir;
        
        if (path.isAbsolute(baseUploadPath)) {
          uploadsDir = baseUploadPath;
        } else {
          uploadsDir = path.join(__dirname, '../../', baseUploadPath);
        }
        
        // Search for the file by its actual filename
        function searchForFile(dir, targetFileName) {
          if (!fs.existsSync(dir)) return null;
          
          const items = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
              const result = searchForFile(fullPath, targetFileName);
              if (result) return result;
            } else {
              if (item.name === targetFileName) {
                return fullPath;
              }
            }
          }
          
          return null;
        }
        
        const filePath = searchForFile(uploadsDir, attachment.fileName);
        if (filePath && fs.existsSync(filePath)) {
          console.log('*** FOUND via DATABASE ***:', filePath);
          await prisma.$disconnect();
          return filePath;
        }
      }
      
      await prisma.$disconnect();
    } catch (dbError) {
      console.log('Database search failed, falling back to filesystem search:', dbError.message);
    }
    
    // Fallback to filesystem search by filename pattern
    const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';
    let uploadsDir;
    
    if (path.isAbsolute(baseUploadPath)) {
      // Absolute path - use as is
      uploadsDir = baseUploadPath;
    } else {
      // Relative path - relative to project root (same as upload middleware)
      uploadsDir = path.join(__dirname, '../../', baseUploadPath);
    }
    
    // Search for file with the given ID in filename
    function searchDirectory(dir) {
      if (!fs.existsSync(dir)) return null;
      
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          const result = searchDirectory(fullPath);
          if (result) return result;
        } else {
          // Check if filename starts with the fileId (new format) or contains it (old format)
          if (item.name.startsWith(fileId) || item.name.includes(fileId)) {
            return fullPath;
          }
        }
      }
      
      return null;
    }
    
    return searchDirectory(uploadsDir);
  }

  getFilePathById(fileId) {
    // This is kept for backward compatibility
    // Use findFileById for async operations
    return null;
  }
}

module.exports = FileUploadController;