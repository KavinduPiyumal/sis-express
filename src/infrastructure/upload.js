const multer = require('multer');
const path = require('path');

function getUploadMiddleware(options = {}) {
  const { subDir } = options;
  let upload;
  if (process.env.UPLOAD_DRIVER === 's3') {
    const multerS3 = require('multer-s3');
    const AWS = require('aws-sdk');
    const s3 = new AWS.S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION,
    });
    upload = multer({
      storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        ...(process.env.S3_IS_PRE_SIGNED === 'false' ? { acl: 'public-read' } : {}),
        key: (req, file, cb) => {
          const { v4: uuidv4 } = require('uuid');
          const fileId = uuidv4();
          let userId = req.user && req.user.id ? req.user.id : (req.body && req.body.id ? req.body.id : 'unknown');
          // Determine subdirectory - use passed subDir or auto-detect
          let finalSubDir = subDir;
          if (!finalSubDir) {
            const isProfileImage = file.fieldname === 'profileImage' || 
                                  (req.route && req.route.path && req.route.path.includes('profile'));
            finalSubDir = isProfileImage ? 'profileImages' : 'assets';
          }
          cb(null, `uploads/${userId}/${finalSubDir}/${fileId}-${Date.now()}-${file.originalname}`);
        }
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        // Determine subdirectory - use passed subDir or auto-detect
        let finalSubDir = subDir;
        if (!finalSubDir) {
          const isProfileImage = file.fieldname === 'profileImage' || 
                                (req.route && req.route.path && req.route.path.includes('profile'));
          finalSubDir = isProfileImage ? 'profileImages' : 'assets';
        }

        let allowedTypes;
        let errorMessage;

        if (finalSubDir === 'profileImages') {
          // For profile images, only allow image files
          allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          errorMessage = 'Only .jpg, .jpeg, .png files are allowed for profile images!';
        } else if (finalSubDir === 'assets') {
          // For notice attachments and general assets, allow various document types
          allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/plain',
            'text/csv'
          ];
          errorMessage = 'File type not supported. Allowed: PDF, Word, Excel, PowerPoint, Images, Text files';
        } else {
          // Default to image files for other subdirectories
          allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          errorMessage = 'Only .jpg, .jpeg, .png files are allowed!';
        }

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(errorMessage));
        }
      }
    });
  } else {
    // local disk storage
    const fs = require('fs');
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        // Use user id from req.user or req.body (for registration)
        let userId = req.user && req.user.id ? req.user.id : (req.body && req.body.id ? req.body.id : 'unknown');
        const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';
        
        // Determine subdirectory - use passed subDir or auto-detect
        let finalSubDir = subDir;
        if (!finalSubDir) {
          const isProfileImage = file.fieldname === 'profileImage' || 
                                 (req.route && req.route.path && req.route.path.includes('profile'));
          finalSubDir = isProfileImage ? 'profileImages' : 'assets';
        }
        
        // Handle both absolute and relative paths
        let userDir;
        if (path.isAbsolute(baseUploadPath)) {
          // Absolute path - use as is
          userDir = path.join(baseUploadPath, userId, finalSubDir);
        } else {
          // Relative path - relative to project root
          userDir = path.join(__dirname, '../../', baseUploadPath, userId, finalSubDir);
        }
        
        // Create the directory if it doesn't exist
        fs.mkdirSync(userDir, { recursive: true });
        cb(null, userDir);
      },
      filename: function (req, file, cb) {
        const { v4: uuidv4 } = require('uuid');
        const fileId = uuidv4();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `${fileId}-${uniqueSuffix}-${file.originalname}`;
        cb(null, filename);
      }
    });
    upload = multer({
      storage: storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (req, file, cb) => {
        // Determine subdirectory - use passed subDir or auto-detect
        let finalSubDir = subDir;
        if (!finalSubDir) {
          const isProfileImage = file.fieldname === 'profileImage' || 
                                 (req.route && req.route.path && req.route.path.includes('profile'));
          finalSubDir = isProfileImage ? 'profileImages' : 'assets';
        }

        let allowedTypes;
        let errorMessage;

        if (finalSubDir === 'profileImages') {
          // For profile images, only allow image files
          allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          errorMessage = 'Only .jpg, .jpeg, .png files are allowed for profile images!';
        } else if (finalSubDir === 'assets') {
          // For notice attachments and general assets, allow various document types
          allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg',
            'image/png',
            'image/jpg',
            'text/plain',
            'text/csv'
          ];
          errorMessage = 'File type not supported. Allowed: PDF, Word, Excel, PowerPoint, Images, Text files';
        } else {
          // Default to image files for other subdirectories
          allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
          errorMessage = 'Only .jpg, .jpeg, .png files are allowed!';
        }

        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(errorMessage));
        }
      }
    });
  }
  return upload;
}

module.exports = getUploadMiddleware;
