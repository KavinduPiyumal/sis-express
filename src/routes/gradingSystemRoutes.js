
const express = require('express');
const controller = require('../controllers/GradingSystemController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'grading_system', { module: 'grading_system', description: 'Grading system created', entityType: 'GradingSystem' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'grading_system', { module: 'grading_system', description: 'Grading system updated', entityType: 'GradingSystem' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'grading_system', { module: 'grading_system', description: 'Grading system deleted', entityType: 'GradingSystem' }), controller.delete);

module.exports = router;
