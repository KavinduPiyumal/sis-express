const express = require('express');
const { param, query } = require('express-validator');
const router = express.Router();
const NoticeController = require('../controllers/NoticeController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const validate = require('../middlewares/validate');

const noticeController = new NoticeController();

// Validation rules for student notice routes
const getNoticeValidation = [
  param('id').isUUID().withMessage('Invalid notice ID')
];

const filterValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('search').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('category').optional().isIn(['general', 'academic', 'finance', 'event', 'emergency']).withMessage('Invalid category'),
  query('priority').optional().isIn(['normal', 'high', 'critical']).withMessage('Invalid priority'),
  query('status').optional().isIn(['published']).withMessage('Students can only view published notices'),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'priority']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('isPinned').optional().custom((value) => {
    if (value === null || value === 'null' || value === undefined || value === 'undefined' || value === '') {
      return true; // Allow null/undefined values
    }
    if (value === 'true' || value === 'false' || value === true || value === false) {
      return true; // Allow boolean values
    }
    throw new Error('isPinned must be true, false, null, or undefined');
  }),
  query('isRead').optional().custom((value) => {
    if (value === null || value === 'null' || value === undefined || value === 'undefined' || value === '') {
      return true; // Allow null/undefined values
    }
    if (value === 'true' || value === 'false' || value === true || value === false) {
      return true; // Allow boolean values
    }
    throw new Error('isRead must be true, false, null, or undefined');
  }),
  query('dateFrom').optional().isISO8601().withMessage('Invalid dateFrom format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid dateTo format')
];

// Apply authentication to all routes
router.use(authenticate);

// Middleware to ensure only students can access and only see published notices
const ensureStudentAndPublished = (req, res, next) => {
  // Force status to published for students
  req.query.status = 'published';
  next();
};

// GET /api/student/notices - Get Student Notices with Pagination & Filtering
router.get('/', 
  ensureStudentAndPublished,
  filterValidation,
  validate,
  async (req, res) => {
    await noticeController.getNotices(req, res);
  }
);

// GET /api/student/notices/unread-count - Get Unread Notices Count
router.get('/unread-count',
  async (req, res) => {
    try {
      // Use the same filtering logic as the main student notices endpoint
      // Force status to published for students
      req.query.status = 'published';
      // Optionally, you can set a high limit to get all notices
      req.query.limit = 1000;
      const { GetNoticesUseCase } = require('../usecases/NoticeUseCases');
      const getNoticesUseCase = new GetNoticesUseCase();
      const result = await getNoticesUseCase.execute(req.query, req.user);
      // Count unread notices using the isRead property (matches frontend logic)
      const unreadCount = result.notices.filter(notice => !notice.isRead).length;
      res.status(200).json({
        success: true,
        data: {
          unreadCount
        },
        message: 'Unread notices count retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to get unread notices count'
      });
    }
  }
);

// GET /api/student/notices/:id - Get Notice by ID (Students only see published)
router.get('/:id',
  getNoticeValidation,
  validate,
  async (req, res) => {
    try {
      // First check if notice is published
      const { GetNoticeByIdUseCase } = require('../usecases/NoticeUseCases');
      const getNoticeByIdUseCase = new GetNoticeByIdUseCase();
      const notice = await getNoticeByIdUseCase.execute(req.params.id, req.user);
      
      // Students can only view published notices
      if (notice.status !== 'published') {
        return res.status(404).json({
          success: false,
          message: 'Notice not found'
        });
      }
      
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
);

// POST /api/student/notices/:id/read - Mark Notice as Read
router.post('/:id/read',
  getNoticeValidation,
  validate,
  auditLogger('mark_read', 'student_notice'),
  async (req, res) => {
    await noticeController.markAsRead(req, res);
  }
);

// POST /api/student/notices/:id/unread - Mark Notice as Unread
router.post('/:id/unread',
  getNoticeValidation,
  validate,
  auditLogger('mark_unread', 'student_notice'),
  async (req, res) => {
    try {
      const { MarkNoticeAsUnreadUseCase } = require('../usecases/NoticeUseCases');
      const markNoticeAsUnreadUseCase = new MarkNoticeAsUnreadUseCase();
      await markNoticeAsUnreadUseCase.execute(req.params.id, req.user);
      
      res.status(200).json({
        success: true,
        message: 'Notice marked as unread successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;