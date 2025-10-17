const express = require('express');
const controller = require('../controllers/CourseOfferingController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireAdmin, requireStudent } = require('../middlewares/authorize');
const studentController = require('../controllers/StudentCourseOfferingController');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

// Fetch course offerings with dynamic filters (lecturerId, subjectId, batchId, semesterId, etc.)
// GET /api/course-offerings?lecturerId=...&subjectId=...&batchId=...&semesterId=...
router.get('/', authenticate, controller.getByFilters);
router.get('/lecturer/myCourses', authenticate, requireAdmin, controller.getAllByLecturer); // Get offerings for logged-in lecturer
router.get('/lecturer/myCourses/light', authenticate, requireAdmin, controller.getAllByLecturerLight); // Lightweight counts-only listing for lecturer

// Student: Get enrolled courses (myCourses)
router.get('/student/myCourses', authenticate, requireStudent, studentController.getMyCourses);

// Student: Get batch available courses (not enrolled)
router.get('/student/batchAvailable', authenticate, requireStudent, studentController.getBatchAvailable);

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'course_offering', { module: 'course_offering', description: 'Course offering created', entityType: 'CourseOffering' }), controller.create);
router.get('/:id', authenticate, controller.getById);
router.get('/:id/details', authenticate, requireAdminOrSuperAdmin, controller.getDetails); // Get active enrollments and sessions for offering
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'course_offering', { module: 'course_offering', description: 'Course offering updated', entityType: 'CourseOffering' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'course_offering', { module: 'course_offering', description: 'Course offering deleted', entityType: 'CourseOffering' }), controller.delete);

module.exports = router;
