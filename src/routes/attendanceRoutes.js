const express = require('express');
const { body, param, query } = require('express-validator');
const attendanceController = require('../controllers/AttendanceController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, checkStudentOwnership } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');

const router = express.Router();

// Validation rules

const createAttendanceValidation = [
  body('studentNo').isString().notEmpty().withMessage('Valid student number is required'),
  body('classSessionId').isUUID().withMessage('Valid class session ID is required'),
  body('courseOfferingId').isUUID().withMessage('Valid course offering ID is required'),
  body('status').isIn(['present', 'absent', 'excused']).withMessage('Invalid status'),
  body('remarks').optional().isString().isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
  body('medicalId').optional().isUUID().withMessage('Invalid medical ID')
];

const updateAttendanceValidation = [
  body('status').optional().isIn(['present', 'absent', 'excused']).withMessage('Invalid status'),
  body('remarks').optional().isString().isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
  body('medicalId').optional().isUUID().withMessage('Invalid medical ID')
];

const bulkAttendanceValidation = [
  body('attendanceRecords').isArray({ min: 1 }).withMessage('Attendance records array is required'),
  body('attendanceRecords.*.studentNo').isString().notEmpty().withMessage('Valid student number is required'),
  body('attendanceRecords.*.classSessionId').isUUID().withMessage('Valid class session ID is required'),
  body('attendanceRecords.*.courseOfferingId').isUUID().withMessage('Valid course offering ID is required'),
  body('attendanceRecords.*.status').isIn(['present', 'absent', 'excused']).withMessage('Invalid status'),
  body('attendanceRecords.*.remarks').optional().isString().isLength({ max: 500 }).withMessage('Remarks cannot exceed 500 characters'),
  body('attendanceRecords.*.medicalId').optional().isUUID().withMessage('Invalid medical ID')
];

const bulkDeleteValidation = [
  body('attendanceIds').isArray({ min: 1 }).withMessage('attendanceIds array is required'),
  body('attendanceIds.*').isUUID().withMessage('Each attendance ID must be a valid UUID')
];

const attendanceIdValidation = [
  param('id').isUUID().withMessage('Valid attendance ID is required')
];


// For student self-attendance queries, no param needed; use authenticated user
const courseSessionQueryValidation = [
  query('courseOfferingId').optional().isUUID().withMessage('Invalid course offering ID'),
  query('classSessionId').optional().isUUID().withMessage('Invalid class session ID')
];

// Routes
router.post('/', authenticate, requireAdminOrSuperAdmin, createAttendanceValidation, validate, auditLogger('create', 'attendance', { module: 'attendance', description: 'Attendance created', entityType: 'Attendance' }), attendanceController.createAttendance);
router.post('/bulk', authenticate, requireAdminOrSuperAdmin, bulkAttendanceValidation, validate, auditLogger('bulk_create', 'attendance', { module: 'attendance', description: 'Bulk attendance created', entityType: 'Attendance' }), attendanceController.bulkCreateAttendance);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, attendanceIdValidation, updateAttendanceValidation, validate, auditLogger('update', 'attendance', { module: 'attendance', description: 'Attendance updated', entityType: 'Attendance' }), attendanceController.updateAttendance);
// Allow assigned lecturer or admins to delete attendance; authorization enforced in usecase
router.delete('/:id', authenticate, attendanceIdValidation, validate, auditLogger('delete', 'attendance', { module: 'attendance', description: 'Attendance deleted', entityType: 'Attendance' }), attendanceController.deleteAttendance);
// Bulk delete
router.post('/bulk-delete', authenticate, bulkDeleteValidation, validate, auditLogger('bulk_delete', 'attendance', { module: 'attendance', description: 'Bulk attendance deleted', entityType: 'Attendance' }), attendanceController.bulkDeleteAttendance);
router.get('/', authenticate, requireAdminOrSuperAdmin, attendanceController.getAllAttendance);
// Student gets their own attendance, optionally filtered by courseOfferingId/classSessionId
router.get('/me', authenticate, courseSessionQueryValidation, validate, attendanceController.getAttendanceByStudent);
router.get('/me/stats', authenticate, courseSessionQueryValidation, validate, attendanceController.getAttendanceStats);

// Admin can get any student's attendance by userId
router.get('/student/:studentId', authenticate, requireAdminOrSuperAdmin, param('studentId').isUUID().withMessage('Valid student ID is required'), courseSessionQueryValidation, validate, attendanceController.getAttendanceByStudent);

// Admin: Get attendance stats for all course offerings assigned to the admin (lecturer)
router.get('/admin/course-offerings/stats', authenticate, requireAdminOrSuperAdmin, attendanceController.getAdminCourseOfferingStats);

router.get('/student/:studentId/stats', authenticate, requireAdminOrSuperAdmin, param('studentId').isUUID().withMessage('Valid student ID is required'), courseSessionQueryValidation, validate, attendanceController.getAttendanceStats);

module.exports = router;
