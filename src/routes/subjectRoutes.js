const express = require('express');
const controller = require('../controllers/SubjectController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'subject', { module: 'subject', description: 'Subject created', entityType: 'Subject' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'subject', { module: 'subject', description: 'Subject updated', entityType: 'Subject' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'subject', { module: 'subject', description: 'Subject deleted', entityType: 'Subject' }), controller.delete);

module.exports = router;
