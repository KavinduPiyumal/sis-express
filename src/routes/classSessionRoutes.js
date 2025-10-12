const express = require('express');
const controller = require('../controllers/ClassSessionController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'class_session', { module: 'class_session', description: 'Class session created', entityType: 'ClassSession' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'class_session', { module: 'class_session', description: 'Class session updated', entityType: 'ClassSession' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'class_session', { module: 'class_session', description: 'Class session deleted', entityType: 'ClassSession' }), controller.delete);

module.exports = router;
