
const express = require('express');
const controller = require('../controllers/DepartmentController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'department', { module: 'department', description: 'Department created', entityType: 'Department' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'department', { module: 'department', description: 'Department updated', entityType: 'Department' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'department', { module: 'department', description: 'Department deleted', entityType: 'Department' }), controller.delete);

module.exports = router;
