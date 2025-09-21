const express = require('express');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const logController = require('../controllers/LogController');

const router = express.Router();

router.get('/', authenticate, requireAdminOrSuperAdmin, logController.getAll);

module.exports = router;
