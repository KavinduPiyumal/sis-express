const express = require('express');
const controller = require('../controllers/DashboardController');
const authenticate = require('../middlewares/auth');
const { requireStudent, requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

// Student dashboard
router.get('/student', authenticate, requireStudent, controller.getStudentDashboard);
// Lecturer/Admin dashboard
router.get('/lecturer', authenticate, requireAdminOrSuperAdmin, controller.getLecturerDashboard);

module.exports = router;