const express = require('express');
const controller = require('../controllers/FacultyController');
const authenticate = require('../middlewares/auth');
const { requireSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, requireSuperAdmin, controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireSuperAdmin, controller.update);
router.delete('/:id', authenticate, requireSuperAdmin, controller.delete);

module.exports = router;
