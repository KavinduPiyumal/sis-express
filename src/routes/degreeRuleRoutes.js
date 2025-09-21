
const express = require('express');
const controller = require('../controllers/DegreeRuleController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'degree_rule', { module: 'degree_rule', description: 'Degree rule created', entityType: 'DegreeRule' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'degree_rule', { module: 'degree_rule', description: 'Degree rule updated', entityType: 'DegreeRule' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'degree_rule', { module: 'degree_rule', description: 'Degree rule deleted', entityType: 'DegreeRule' }), controller.delete);

module.exports = router;
