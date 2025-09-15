const express = require('express');
const controller = require('../controllers/EnrollmentController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireStudent } = require('../middlewares/authorize');
const router = express.Router();

// Student requests enrollment (pending approval)
router.post('/request', authenticate, requireStudent, controller.requestEnrollment);
// Admin/super_admin approves enrollment
router.put('/:id/approve', authenticate, requireAdminOrSuperAdmin, controller.approveEnrollment);
// Admin/super_admin enrolls student directly
router.post('/', authenticate, requireAdminOrSuperAdmin, controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, controller.delete);

module.exports = router;
