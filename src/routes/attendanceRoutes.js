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
  body('studentId').isUUID().withMessage('Valid student ID is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required'),
  body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty if provided'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const updateAttendanceValidation = [
  body('status').optional().isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty if provided'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
];

const bulkAttendanceValidation = [
  body('attendanceRecords').isArray({ min: 1 }).withMessage('Attendance records array is required'),
  body('attendanceRecords.*.studentId').isUUID().withMessage('Valid student ID is required'),
  body('attendanceRecords.*.date').isISO8601().toDate().withMessage('Valid date is required'),
  body('attendanceRecords.*.status').isIn(['present', 'absent', 'late']).withMessage('Invalid status')
];

const attendanceIdValidation = [
  param('id').isUUID().withMessage('Valid attendance ID is required')
];

const studentIdValidation = [
  param('studentId').isUUID().withMessage('Valid student ID is required')
];

// Routes
router.post('/', authenticate, requireAdminOrSuperAdmin, createAttendanceValidation, validate, auditLogger('create', 'attendance', { module: 'attendance', description: 'Attendance created', entityType: 'Attendance' }), attendanceController.createAttendance);
router.post('/bulk', authenticate, requireAdminOrSuperAdmin, bulkAttendanceValidation, validate, auditLogger('bulk_create', 'attendance', { module: 'attendance', description: 'Bulk attendance created', entityType: 'Attendance' }), attendanceController.bulkCreateAttendance);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, attendanceIdValidation, updateAttendanceValidation, validate, auditLogger('update', 'attendance', { module: 'attendance', description: 'Attendance updated', entityType: 'Attendance' }), attendanceController.updateAttendance);
router.get('/', authenticate, requireAdminOrSuperAdmin, attendanceController.getAllAttendance);
router.get('/:studentId', authenticate, studentIdValidation, validate, checkStudentOwnership, attendanceController.getAttendanceByStudent);
router.get('/:studentId/stats', authenticate, studentIdValidation, validate, checkStudentOwnership, attendanceController.getAttendanceStats);

module.exports = router;
