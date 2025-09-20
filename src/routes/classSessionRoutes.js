const express = require('express');
const controller = require('../controllers/ClassSessionController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, requireAdminOrSuperAdmin, controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, controller.delete);

module.exports = router;
