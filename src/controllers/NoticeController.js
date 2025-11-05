const {
  CreateNoticeUseCase,
  GetNoticesUseCase,
  GetNoticeByIdUseCase,
  UpdateNoticeUseCase,
  DeleteNoticeUseCase,
  BulkActionUseCase,
  MarkNoticeAsReadUseCase,
  GetNoticeStatsUseCase,
  GetSearchSuggestionsUseCase,
  GetNoticeMetadataUseCase
} = require('../usecases/NoticeUseCases');

class NoticeController {
  constructor() {
    this.createNoticeUseCase = new CreateNoticeUseCase();
    this.getNoticesUseCase = new GetNoticesUseCase();
    this.getNoticeByIdUseCase = new GetNoticeByIdUseCase();
    this.updateNoticeUseCase = new UpdateNoticeUseCase();
    this.deleteNoticeUseCase = new DeleteNoticeUseCase();
    this.bulkActionUseCase = new BulkActionUseCase();
    this.markNoticeAsReadUseCase = new MarkNoticeAsReadUseCase();
    this.getNoticeStatsUseCase = new GetNoticeStatsUseCase();
    this.getSearchSuggestionsUseCase = new GetSearchSuggestionsUseCase();
    this.getNoticeMetadataUseCase = new GetNoticeMetadataUseCase();
  }

  // GET /api/notices - Get Notices with Pagination & Filtering
  async getNotices(req, res) {
    try {
      const result = await this.getNoticesUseCase.execute(req.query, req.user);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Notices retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/notices/:id - Get Notice by ID
  async getNoticeById(req, res) {
    try {
      const { id } = req.params;
      const notice = await this.getNoticeByIdUseCase.execute(id, req.user);
      
      res.status(200).json({
        success: true,
        data: { notice },
        message: 'Notice retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/notices - Create Notice
  async createNotice(req, res) {
    try {
      // Handle file attachments if any
      const attachments = this.processAttachments(req.body.attachments);
      
      const notice = await this.createNoticeUseCase.execute(req.body, req.user, attachments);
      
      // Calculate notifications sent (simplified)
      const notificationStats = {
        sent: 0,
        failed: 0,
        recipients: []
      };

      res.status(201).json({
        success: true,
        data: {
          notice,
          notifications: notificationStats
        },
        message: 'Notice created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/notices/:id - Update Notice
  async updateNotice(req, res) {
    try {
      const { id } = req.params;
      
      // Handle file attachments if any
      const attachments = this.processAttachments(req.body.attachments);
      
      const notice = await this.updateNoticeUseCase.execute(id, req.body, req.user, attachments);
      
      res.status(200).json({
        success: true,
        data: { notice },
        message: 'Notice updated successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/notices/:id - Delete Notice
  async deleteNotice(req, res) {
    try {
      const { id } = req.params;
      const result = await this.deleteNoticeUseCase.execute(id, req.user);
      
      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/notices/bulk-actions - Bulk Actions
  async bulkActions(req, res) {
    try {
      const result = await this.bulkActionUseCase.execute(req.body, req.user);
      
      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes('Unauthorized') ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/notices/:id/read - Mark as Read
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const result = await this.markNoticeAsReadUseCase.execute(id, req.user);
      
      res.status(200).json(result);
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/notices/stats - Get Statistics
  async getStats(req, res) {
    try {
      const stats = await this.getNoticeStatsUseCase.execute(req.user);
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Statistics retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/notices/search/suggestions - Search Suggestions
  async getSearchSuggestions(req, res) {
    try {
      const { q, limit } = req.query;
      const result = await this.getSearchSuggestionsUseCase.execute(q, parseInt(limit) || 5, req.user);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'Search suggestions retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/notices/metadata - Get Metadata
  async getMetadata(req, res) {
    try {
      const metadata = await this.getNoticeMetadataUseCase.execute(req.user);
      
      res.status(200).json({
        success: true,
        data: metadata,
        message: 'Metadata retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Helper method to process attachment IDs
  processAttachments(attachmentData) {
    if (!attachmentData || !Array.isArray(attachmentData)) {
      return [];
    }

    // Convert attachment data to the format expected by the repository
    return attachmentData.map(attachment => ({
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      fileSize: attachment.fileSize,
      mimeType: attachment.mimeType,
      filePath: attachment.url || attachment.downloadUrl || attachment.filePath || attachment.fileName || 'unknown',
      downloadUrl: attachment.url || attachment.downloadUrl
    }));
  }

  // Helper method for error handling
  handleError(error, res) {
    console.error('Notice Controller Error:', error);
    
    let statusCode = 500;
    let message = 'Internal server error';

    if (error.message.includes('Validation failed')) {
      statusCode = 400;
      message = error.message;
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      message = error.message;
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 403;
      message = error.message;
    } else if (error.message.includes('Failed to')) {
      statusCode = 400;
      message = error.message;
    }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}

module.exports = NoticeController;