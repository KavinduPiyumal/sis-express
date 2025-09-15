const express = require('express');
const controller = require('../controllers/MedicalReportController');
const authenticate = require('../middlewares/auth');
const { requireStudent, requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

// Student submits medical report
router.post('/', authenticate, requireStudent, controller.submit);
// Admin/lecturer reviews medical report
router.put('/:id/review', authenticate, requireAdminOrSuperAdmin, controller.review);
// Get all reports for a student
router.get('/student/:studentId', authenticate, controller.getByStudent);
// Get all reports (admin only)
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll);

module.exports = router;
