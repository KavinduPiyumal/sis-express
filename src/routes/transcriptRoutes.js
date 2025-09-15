const express = require('express');
const controller = require('../controllers/TranscriptController');
const authenticate = require('../middlewares/auth');
const router = express.Router();

router.post('/', authenticate, controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;
