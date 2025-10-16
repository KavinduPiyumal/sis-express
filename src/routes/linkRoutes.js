const express = require('express');
const { body, param, query } = require('express-validator');
const LinkController = require('../controllers/LinkController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');

const router = express.Router();
const linkController = new LinkController();

// Validation rules
const createLinkValidation = [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  body('url').isURL().withMessage('Valid URL is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('priority').optional().isIn(['normal', 'highlight']).withMessage('Priority must be normal or highlight'),
  body('icon').optional().isLength({ max: 100 }).withMessage('Icon must not exceed 100 characters'),
  body('openMode').optional().isIn(['newtab', 'sametab']).withMessage('Open mode must be newtab or sametab'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('targetAudience').optional().isIn(['all', 'students', 'admins']).withMessage('Target audience must be all, students, or admins'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

const updateLinkValidation = [
  body('title').optional().notEmpty().withMessage('Title cannot be empty').isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  body('url').optional().isURL().withMessage('Valid URL is required'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  body('priority').optional().isIn(['normal', 'highlight']).withMessage('Priority must be normal or highlight'),
  body('icon').optional().isLength({ max: 100 }).withMessage('Icon must not exceed 100 characters'),
  body('openMode').optional().isIn(['newtab', 'sametab']).withMessage('Open mode must be newtab or sametab'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('targetAudience').optional().isIn(['all', 'students', 'admins']).withMessage('Target audience must be all, students, or admins'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO 8601 date'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid ISO 8601 date'),
];

const updateOrderValidation = [
  body('linkUpdates').isArray().withMessage('linkUpdates must be an array'),
  body('linkUpdates.*.id').notEmpty().withMessage('Each link update must have an id'),
  body('linkUpdates.*.order').isInt({ min: 0 }).withMessage('Each link update must have a non-negative order'),
];

const bulkUpdateValidation = [
  body('linkIds').isArray().withMessage('linkIds must be an array'),
  body('linkIds.*').isUUID().withMessage('Each link ID must be a valid UUID'),
  body('updateData').isObject().withMessage('updateData must be an object'),
];

const bulkDeleteValidation = [
  body('linkIds').isArray().withMessage('linkIds must be an array'),
  body('linkIds.*').isUUID().withMessage('Each link ID must be a valid UUID'),
];

const idValidation = [
  param('id').isUUID().withMessage('Invalid link ID'),
];

const queryValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('category').optional().isLength({ max: 100 }).withMessage('Category must not exceed 100 characters'),
  query('priority').optional().isIn(['normal', 'highlight']).withMessage('Priority must be normal or highlight'),
  query('targetAudience').optional().isIn(['all', 'students', 'admins']).withMessage('Target audience must be all, students, or admins'),
  query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  query('search').optional().isLength({ max: 255 }).withMessage('Search must not exceed 255 characters'),
  query('sortBy').optional().isIn(['title', 'order', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
  query('includeExpired').optional().isBoolean().withMessage('includeExpired must be a boolean'),
  query('createdBy').optional().isUUID().withMessage('createdBy must be a valid UUID'),
];

// Public routes (no authentication required)
router.get('/public/active', queryValidation, validate, linkController.getPublicActiveLinks);
router.post('/public/:id/view', idValidation, validate, linkController.incrementLinkView);

// Protected routes (authentication required)
router.use(authenticate);

// Routes accessible by authenticated users
router.get('/active', queryValidation, validate, linkController.getActiveLinks);
router.get('/categories', linkController.getLinkCategories);
router.get('/my-links', queryValidation, validate, linkController.getUserLinks);
router.get('/most-viewed', linkController.getMostViewedLinks);

// Debug endpoint - temporary
router.get('/debug/user', (req, res) => {
  console.log('🔍 Debug User Info:');
  console.log('req.user:', req.user);
  console.log('req.user.role:', req.user?.role);
  console.log('req.user.id:', req.user?.id);
  
  res.json({
    success: true,
    debug: {
      hasUser: !!req.user,
      userRole: req.user?.role,
      userId: req.user?.id,
      userName: req.user?.username,
      firstName: req.user?.firstName,
      userObject: req.user
    }
  });
});

// Admin routes (admin and super_admin only)
router.get('/statistics', requireAdminOrSuperAdmin, linkController.getLinkStatistics);
router.get('/', requireAdminOrSuperAdmin, queryValidation, validate, linkController.getLinks);

// Single link route (must come after /statistics to avoid conflict)
router.get('/:id', idValidation, validate, linkController.getLinkById);

// View tracking route
router.post('/:id/view', idValidation, validate, linkController.incrementLinkView);

router.post('/', 
  requireAdminOrSuperAdmin, 
  createLinkValidation, 
  validate, 
  auditLogger('create', 'link', { module: 'links', description: 'Link created', entityType: 'Link' }), 
  linkController.createLink
);

router.put('/:id', 
  requireAdminOrSuperAdmin, 
  idValidation, 
  updateLinkValidation, 
  validate, 
  auditLogger('update', 'link', { module: 'links', description: 'Link updated', entityType: 'Link' }), 
  linkController.updateLink
);

router.delete('/:id', 
  requireAdminOrSuperAdmin, 
  idValidation, 
  validate, 
  auditLogger('delete', 'link', { module: 'links', description: 'Link deleted', entityType: 'Link' }), 
  linkController.deleteLink
);

router.patch('/:id/toggle-status', 
  requireAdminOrSuperAdmin, 
  idValidation, 
  validate, 
  auditLogger('update', 'link', { module: 'links', description: 'Link status toggled', entityType: 'Link' }), 
  linkController.toggleLinkStatus
);

router.post('/:id/duplicate', 
  requireAdminOrSuperAdmin, 
  idValidation, 
  validate, 
  auditLogger('create', 'link', { module: 'links', description: 'Link duplicated', entityType: 'Link' }), 
  linkController.duplicateLink
);

router.patch('/order', 
  requireAdminOrSuperAdmin, 
  updateOrderValidation, 
  validate, 
  auditLogger('update', 'link', { module: 'links', description: 'Link orders updated', entityType: 'Link' }), 
  linkController.updateLinkOrder
);

// Bulk operations
router.patch('/bulk/update', 
  requireAdminOrSuperAdmin, 
  bulkUpdateValidation, 
  validate, 
  auditLogger('update', 'link', { module: 'links', description: 'Bulk links updated', entityType: 'Link' }), 
  linkController.bulkUpdateLinks
);

router.delete('/bulk/delete', 
  requireAdminOrSuperAdmin, 
  bulkDeleteValidation, 
  validate, 
  auditLogger('delete', 'link', { module: 'links', description: 'Bulk links deleted', entityType: 'Link' }), 
  linkController.bulkDeleteLinks
);

module.exports = router;