const express = require('express');
const controller = require('../controllers/BatchController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

const auditLogger = require('../middlewares/auditLogger');
router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'batch', { module: 'batch', description: 'Batch created', entityType: 'Batch' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'batch', { module: 'batch', description: 'Batch updated', entityType: 'Batch' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'batch', { module: 'batch', description: 'Batch deleted', entityType: 'Batch' }), controller.delete);

module.exports = router;
