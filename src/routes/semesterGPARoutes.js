
const express = require('express');
const controller = require('../controllers/SemesterGPAController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'semester_gpa', { module: 'semester_gpa', description: 'Semester GPA created', entityType: 'SemesterGPA' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'semester_gpa', { module: 'semester_gpa', description: 'Semester GPA updated', entityType: 'SemesterGPA' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'semester_gpa', { module: 'semester_gpa', description: 'Semester GPA deleted', entityType: 'SemesterGPA' }), controller.delete);

module.exports = router;
