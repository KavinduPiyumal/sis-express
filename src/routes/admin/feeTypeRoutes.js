const express = require('express');
const auditLogger = require('../../middlewares/auditLogger');
const router = express.Router();
const FeeTypeAdminController = require('../../controllers/admin/FeeTypeAdminController');
const authenticate = require('../../middlewares/auth');
const controller = new FeeTypeAdminController();

router.use(authenticate);

router.get('/', async (req, res) => controller.list(req, res));
router.post('/', auditLogger('create', 'fee_type', { module: 'payments', description: 'Fee type created', entityType: 'FeeType' }), async (req, res) => controller.create(req, res));
router.get('/:feeTypeId', async (req, res) => controller.get(req, res));
router.put('/:feeTypeId', auditLogger('update', 'fee_type', { module: 'payments', description: 'Fee type updated', entityType: 'FeeType' }), async (req, res) => controller.update(req, res));
router.delete('/:feeTypeId', auditLogger('delete', 'fee_type', { module: 'payments', description: 'Fee type deleted', entityType: 'FeeType' }), async (req, res) => controller.delete(req, res));
router.delete('/:feeTypeId/hard', auditLogger('hard_delete', 'fee_type', { module: 'payments', description: 'Fee type hard deleted', entityType: 'FeeType' }), async (req, res) => controller.hardDelete(req, res));

module.exports = router;
