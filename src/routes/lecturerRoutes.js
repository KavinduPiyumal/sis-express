
const express = require('express');
const controller = require('../controllers/LecturerController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'lecturer', { module: 'lecturer', description: 'Lecturer updated', entityType: 'Lecturer' }), controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('delete', 'lecturer', { module: 'lecturer', description: 'Lecturer deleted', entityType: 'Lecturer' }), controller.delete);

module.exports = router;
