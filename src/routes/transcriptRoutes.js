const express = require('express');
const controller = require('../controllers/TranscriptController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'transcript', { module: 'transcript', description: 'Transcript created', entityType: 'Transcript' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'transcript', { module: 'transcript', description: 'Transcript updated', entityType: 'Transcript' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'transcript', { module: 'transcript', description: 'Transcript deleted', entityType: 'Transcript' }), controller.delete);

module.exports = router;
