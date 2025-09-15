const express = require('express');
const controller = require('../controllers/SubjectController');
const authenticate = require('../middlewares/auth');
const router = express.Router();

const { requireAdminOrSuperAdmin } = require('../middlewares/authorize');

router.post('/', authenticate, requireAdminOrSuperAdmin, controller.create);
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, requireAdminOrSuperAdmin, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;
