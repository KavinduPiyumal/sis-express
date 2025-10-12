const express = require('express');
const controller = require('../controllers/SemesterController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'semester', { module: 'semester', description: 'Semester created', entityType: 'Semester' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/batch/:batchId', authenticate, controller.getByBatchId);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'semester', { module: 'semester', description: 'Semester updated', entityType: 'Semester' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'semester', { module: 'semester', description: 'Semester deleted', entityType: 'Semester' }), controller.delete);

module.exports = router;
