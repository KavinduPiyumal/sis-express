
const express = require('express');
const controller = require('../controllers/MedicalReportController');
const authenticate = require('../middlewares/auth');
const { requireStudent, requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

// Student submits medical report
router.post('/', authenticate, requireStudent, auditLogger('create', 'medical_report', { module: 'medical_report', description: 'Medical report submitted', entityType: 'MedicalReport' }), controller.submit);
// Admin/lecturer reviews medical report
router.put('/:id/review', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'medical_report', { module: 'medical_report', description: 'Medical report reviewed', entityType: 'MedicalReport' }), controller.review);
// Get all reports for a student
router.get('/student/:studentId', authenticate, controller.getByStudent);
// Get all reports (admin only)
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll);

module.exports = router;
