const express = require('express');
const router = express.Router();
const FeeTypeAdminController = require('../../controllers/admin/FeeTypeAdminController');
const authenticate = require('../../middlewares/auth');
const controller = new FeeTypeAdminController();

router.use(authenticate);

router.get('/', async (req, res) => controller.list(req, res));
router.post('/', async (req, res) => controller.create(req, res));
router.get('/:feeTypeId', async (req, res) => controller.get(req, res));
router.put('/:feeTypeId', async (req, res) => controller.update(req, res));
router.delete('/:feeTypeId', async (req, res) => controller.delete(req, res));

module.exports = router;
