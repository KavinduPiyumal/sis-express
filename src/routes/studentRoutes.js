const express = require('express');
const controller = require('../controllers/StudentController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'student', { module: 'student', description: 'Student updated', entityType: 'Student' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'student', { module: 'student', description: 'Student deleted', entityType: 'Student' }), controller.delete);

module.exports = router;
