const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const NoticeController = require('../controllers/NoticeController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireAnyRole } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const validate = require('../middlewares/validate');

const noticeController = new NoticeController();

// Validation rules
const createNoticeValidation = [
  body('title').notEmpty().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be between 1 and 200 characters'),
  body('body').notEmpty().trim().withMessage('Body is required'),
  body('category').optional().isIn(['general', 'academic', 'finance', 'event', 'emergency']).withMessage('Invalid category'),
  body('priority').optional().isIn(['normal', 'high', 'critical']).withMessage('Invalid priority'),
  body('audience').optional().isArray().withMessage('Audience must be an array'),
  body('audience.*').optional().isIn(['all', 'students', 'admins', 'all_students', 'all_lecturers']).withMessage('Invalid audience value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().trim().withMessage('Each tag must be a string'),
  body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
  body('status').optional().isIn(['published', 'draft', 'archived']).withMessage('Invalid status')
];

const updateNoticeValidation = [
  param('id').isUUID().withMessage('Invalid notice ID'),
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('body').optional().trim().notEmpty().withMessage('Body cannot be empty'),
  body('category').optional().isIn(['general', 'academic', 'finance', 'event', 'emergency']).withMessage('Invalid category'),
  body('priority').optional().isIn(['normal', 'high', 'critical']).withMessage('Invalid priority'),
  body('audience').optional().isArray().withMessage('Audience must be an array'),
  body('audience.*').optional().isIn(['all', 'students', 'admins', 'all_students', 'all_lecturers']).withMessage('Invalid audience value'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().trim().withMessage('Each tag must be a string'),
  body('startDate').optional().isISO8601().toDate().withMessage('Invalid start date format'),
  body('endDate').optional().isISO8601().toDate().withMessage('Invalid end date format'),
  body('isPinned').optional().isBoolean().withMessage('isPinned must be a boolean'),
  body('status').optional().isIn(['published', 'draft', 'archived']).withMessage('Invalid status')
];

const getNoticeValidation = [
  param('id').isUUID().withMessage('Invalid notice ID')
];

const bulkActionValidation = [
  body('action').isIn(['delete', 'markRead', 'markUnread', 'pin', 'unpin', 'archive', 'unarchive', 'publish', 'unpublish', 'draft']).withMessage('Invalid bulk action'),
  body('noticeIds').isArray({ min: 1 }).withMessage('noticeIds must be a non-empty array'),
  body('noticeIds.*').isUUID().withMessage('Each notice ID must be a valid UUID')
];

const searchValidation = [
  query('q').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000')
];

const filterValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('category').optional().isIn(['general', 'academic', 'finance', 'event', 'emergency']).withMessage('Invalid category'),
  query('priority').optional().isIn(['normal', 'high', 'critical']).withMessage('Invalid priority'),
  query('status').optional().isIn(['published', 'draft', 'archived']).withMessage('Invalid status'),
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
  })
];

// Apply authentication to all routes
router.use(authenticate);

// GET /api/notices - Get Notices with Pagination & Filtering
router.get('/', 
  filterValidation,
  validate,
  requireAnyRole,
  async (req, res) => {
    await noticeController.getNotices(req, res);
  }
);

// GET /api/notices/stats - Get Statistics (must be before /:id route)
router.get('/stats',
  requireAnyRole,
  async (req, res) => {
    await noticeController.getStats(req, res);
  }
);

// GET /api/notices/search/suggestions - Search Suggestions
router.get('/search/suggestions',
  searchValidation,
  validate,
  requireAnyRole,
  async (req, res) => {
    await noticeController.getSearchSuggestions(req, res);
  }
);

// GET /api/notices/metadata - Get Metadata
router.get('/metadata',
  requireAnyRole,
  async (req, res) => {
    await noticeController.getMetadata(req, res);
  }
);

// GET /api/notices/:id - Get Notice by ID
router.get('/:id',
  getNoticeValidation,
  validate,
  requireAnyRole,
  async (req, res) => {
    await noticeController.getNoticeById(req, res);
  }
);

// POST /api/notices - Create Notice
router.post('/',
  createNoticeValidation,
  validate,
  requireAdminOrSuperAdmin,
  auditLogger('create', 'notice', { module: 'notices', description: 'Notice created', entityType: 'Notice' }),
  async (req, res) => {
    await noticeController.createNotice(req, res);
  }
);

// PUT /api/notices/:id - Update Notice
router.put('/:id',
  updateNoticeValidation,
  validate,
  requireAdminOrSuperAdmin,
  auditLogger('update', 'notice', { module: 'notices', description: 'Notice updated', entityType: 'Notice' }),
  async (req, res) => {
    await noticeController.updateNotice(req, res);
  }
);

// DELETE /api/notices/:id - Delete Notice
router.delete('/:id',
  getNoticeValidation,
  validate,
  requireAdminOrSuperAdmin,
  auditLogger('delete', 'notice', { module: 'notices', description: 'Notice deleted', entityType: 'Notice' }),
  async (req, res) => {
    await noticeController.deleteNotice(req, res);
  }
);

// POST /api/notices/bulk-actions - Bulk Actions
router.post('/bulk-actions',
  bulkActionValidation,
  validate,
  requireAdminOrSuperAdmin,
  auditLogger('bulk_action', 'notice', { module: 'notices', description: 'Bulk notice action', entityType: 'Notice' }),
  async (req, res) => {
    await noticeController.bulkActions(req, res);
  }
);

// POST /api/notices/:id/read - Mark as Read
router.post('/:id/read',
  getNoticeValidation,
  validate,
  requireAnyRole,
  auditLogger('mark_read', 'notice', { module: 'notices', description: 'Notice marked as read', entityType: 'Notice' }),
  async (req, res) => {
    await noticeController.markAsRead(req, res);
  }
);

module.exports = router;