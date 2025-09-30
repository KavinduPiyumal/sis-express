const express = require('express');
const controller = require('../controllers/ResultController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireAdmin, requireStudent } = require('../middlewares/authorize');
const router = express.Router();

// Student-specific routes (must come before generic routes to avoid conflicts)
router.get('/student/my-results', authenticate, requireStudent, controller.getMyResults); // Student's own results
router.get('/student/my-gpa', authenticate, requireStudent, controller.getMyGPA); // Student's own GPA
router.get('/student/my-academic-record', authenticate, requireStudent, controller.getMyAcademicRecord); // Student's complete academic record

// Lecturer-specific routes
router.get('/lecturer/my-results', authenticate, requireAdmin, controller.getMyLecturerResults); // Lecturer's course results

// Admin/SuperAdmin routes for bulk operations
router.post('/bulk', authenticate, requireAdminOrSuperAdmin, controller.bulkCreate); // Bulk create results

// GPA calculation routes - Admin only
router.get('/gpa/student/:studentId', authenticate, requireAdminOrSuperAdmin, controller.getStudentGPA); // Calculate student GPA
router.get('/academic-record/student/:studentId', authenticate, requireAdminOrSuperAdmin, controller.getStudentAcademicRecord); // Get complete academic record

// General result operations
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll); // Get all results with filtering - Admin only
router.post('/', authenticate, requireAdminOrSuperAdmin, controller.create); // Create single result
router.get('/:id', authenticate, requireAdminOrSuperAdmin, controller.getById); // Get result by ID - Admin only
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update); // Update result
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, controller.delete); // Delete result

// Results by relationships - Admin only
router.get('/student/:studentId', authenticate, requireAdminOrSuperAdmin, controller.getByStudentId); // Results by student ID
router.get('/course-offering/:courseOfferingId', authenticate, requireAdminOrSuperAdmin, controller.getByCourseOfferingId); // Results by course offering ID
router.get('/course-offering/:courseOfferingId/statistics', authenticate, requireAdminOrSuperAdmin, controller.getCourseOfferingStatistics); // Course offering statistics

module.exports = router;