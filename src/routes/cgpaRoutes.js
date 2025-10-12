const express = require('express');
const controller = require('../controllers/CGPAController');
const authenticate = require('../middlewares/auth');
const auditLogger = require('../middlewares/auditLogger');
const router = express.Router();

router.post('/', authenticate, auditLogger('create', 'cgpa', { module: 'cgpa', description: 'CGPA created', entityType: 'CGPA' }), controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, auditLogger('update', 'cgpa', { module: 'cgpa', description: 'CGPA updated', entityType: 'CGPA' }), controller.update);
router.delete('/:id', authenticate, auditLogger('delete', 'cgpa', { module: 'cgpa', description: 'CGPA deleted', entityType: 'CGPA' }), controller.delete);

module.exports = router;
