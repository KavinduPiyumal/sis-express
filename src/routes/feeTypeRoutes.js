const express = require('express');
const router = express.Router();
const FeeTypeController = require('../controllers/FeeTypeController');
const controller = new FeeTypeController();

// Public endpoint for fee types
router.get('/', async (req, res) => controller.list(req, res));

module.exports = router;
