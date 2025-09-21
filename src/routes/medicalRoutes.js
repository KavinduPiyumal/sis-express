
const express = require('express');
const controller = require('../controllers/MedicalController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireStudent } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, requireStudent, auditLogger('create', 'medical', { module: 'medical', description: 'Medical record created', entityType: 'Medical' }), controller.create);
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'medical', { module: 'medical', description: 'Medical record updated', entityType: 'Medical' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'medical', { module: 'medical', description: 'Medical record deleted', entityType: 'Medical' }), controller.delete);

module.exports = router;
