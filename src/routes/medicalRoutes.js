const express = require('express');
const controller = require('../controllers/MedicalController');
const authenticate = require('../middlewares/auth');
const { requireAdminOrSuperAdmin, requireStudent } = require('../middlewares/authorize');
const router = express.Router();

router.post('/', authenticate, requireStudent, controller.create);
router.get('/', authenticate, requireAdminOrSuperAdmin, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update);
router.delete('/:id', authenticate, requireAdminOrSuperAdmin, controller.delete);

module.exports = router;
