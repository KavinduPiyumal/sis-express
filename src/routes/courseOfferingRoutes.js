const express = require('express');
const controller = require('../controllers/CourseOfferingController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin ,requireAdmin} = require('../middlewares/authorize');
const router = express.Router();


// Fetch course offerings with dynamic filters (lecturerId, subjectId, batchId, semesterId, etc.)
// GET /api/course-offerings?lecturerId=...&subjectId=...&batchId=...&semesterId=...
router.get('/', authenticate, controller.getByFilters);
router.get('/lecturer/myCourses', authenticate, requireAdmin, controller.getAllByLecturer); // Get offerings for logged-in lecturer

router.post('/', authenticate, requireAdminOrSuperAdmin, controller.create);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, controller.delete);

module.exports = router;
