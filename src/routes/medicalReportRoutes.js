

const express = require('express');
const controller = require('../controllers/MedicalReportController');
const authenticate = require('../middlewares/auth');
const { requireStudent, requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();


// Student submits medical report
router.post('/', authenticate, requireStudent, auditLogger('create', 'medical_report', { module: 'medical_report', description: 'Medical report submitted', entityType: 'MedicalReport' }), controller.submit);

// Student updates their own medical report (only if status is pending)
router.put('/:id', authenticate, requireStudent, auditLogger('update', 'medical_report', { module: 'medical_report', description: 'Medical report updated', entityType: 'MedicalReport' }), controller.updateByStudent);

// Student deletes their own medical report (only if status is pending)
router.delete('/:id', authenticate, requireStudent, auditLogger('delete', 'medical_report', { module: 'medical_report', description: 'Medical report deleted', entityType: 'MedicalReport' }), controller.deleteByStudent);

// Admin/lecturer reviews medical report
router.put('/:id/review', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'medical_report', { module: 'medical_report', description: 'Medical report reviewed', entityType: 'MedicalReport' }), controller.review);


// Get medical report summary stats for the authenticated student
router.get('/student/summary', authenticate, controller.getStudentSummaryStats);

// Get all reports for a student
router.get('/student/:studentId', authenticate, controller.getByStudent);


// Admin: Get all medical reports for course offerings assigned to admin (with all relations)
router.get('/admin/course-offerings', authenticate, requireAdminOrSuperAdmin, controller.getByAdminCourseOfferings);

// Delete a medical report attachment by id (fileId)
router.delete('/attachments/:fileId', authenticate, requireStudent, controller.deleteAttachment);
// Get all reports (admin only)
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll);



module.exports = router;
