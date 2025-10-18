const express = require('express');
const controller = require('../controllers/BatchController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

const auditLogger = require('../middlewares/auditLogger');

// Admin tool: fix semesters for a batch (delete and recreate semesters)
router.patch('/:id/fix-semesters', authenticate, requireAdminOrSuperAdmin, auditLogger('fixSemesters', 'batch', { module: 'batch', description: 'Semesters fixed for batch', entityType: 'Batch' }), controller.fixSemesters);

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'batch', { module: 'batch', description: 'Batch created', entityType: 'Batch' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'batch', { module: 'batch', description: 'Batch updated', entityType: 'Batch' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'batch', { module: 'batch', description: 'Batch deleted', entityType: 'Batch' }), controller.delete);

module.exports = router;
