
const express = require('express');
const controller = require('../controllers/EnrollmentController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireStudent } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

// Student requests enrollment (pending approval)
router.post('/request', authenticate, requireStudent, auditLogger('create', 'enrollment_request', { module: 'enrollment', description: 'Enrollment request created', entityType: 'Enrollment' }), controller.requestEnrollment);
// Admin/super_admin approves enrollment
router.put('/:id/approve', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'enrollment', { module: 'enrollment', description: 'Enrollment approved', entityType: 'Enrollment' }), controller.approveEnrollment);
// Admin/super_admin enrolls student directly
router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'enrollment', { module: 'enrollment', description: 'Enrollment created', entityType: 'Enrollment' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'enrollment', { module: 'enrollment', description: 'Enrollment updated', entityType: 'Enrollment' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'enrollment', { module: 'enrollment', description: 'Enrollment deleted', entityType: 'Enrollment' }), controller.delete);

module.exports = router;
