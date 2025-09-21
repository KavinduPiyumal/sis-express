
const express = require('express');
const controller = require('../controllers/FacultyController');
const authenticate = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, requireSuperAdmin, auditLogger('create', 'faculty', { module: 'faculty', description: 'Faculty created', entityType: 'Faculty' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireSuperAdmin, auditLogger('update', 'faculty', { module: 'faculty', description: 'Faculty updated', entityType: 'Faculty' }), controller.update);
router.delete('/:id', authenticate, requireSuperAdmin, auditLogger('delete', 'faculty', { module: 'faculty', description: 'Faculty deleted', entityType: 'Faculty' }), controller.delete);

module.exports = router;
