const express = require('express');
const controller = require('../controllers/SemesterController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const { requireSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'semester', { module: 'semester', description: 'Semester created', entityType: 'Semester' }), controller.create);

// Start next semester for a batch (super_admin only)
router.post('/start-next/:batchId', authenticate, requireSuperAdmin, auditLogger('start_next', 'semester', { module: 'semester', description: 'Started next semester for batch', entityType: 'Semester' }), controller.startNextSemesterForBatch);
router.get('/', authenticate, controller.getAll);
router.get('/batch/:batchId', authenticate, controller.getByBatchId);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'semester', { module: 'semester', description: 'Semester updated', entityType: 'Semester' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'semester', { module: 'semester', description: 'Semester deleted', entityType: 'Semester' }), controller.delete);



module.exports = router;
