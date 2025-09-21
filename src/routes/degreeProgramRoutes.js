
const express = require('express');
const controller = require('../controllers/DegreeProgramController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, requireAdminOrSuperAdmin, auditLogger('create', 'degree_program', { module: 'degree_program', description: 'Degree program created', entityType: 'DegreeProgram' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, auditLogger('update', 'degree_program', { module: 'degree_program', description: 'Degree program updated', entityType: 'DegreeProgram' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'degree_program', { module: 'degree_program', description: 'Degree program deleted', entityType: 'DegreeProgram' }), controller.delete);

module.exports = router;
