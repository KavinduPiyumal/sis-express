const express = require('express');
const { body, param, query } = require('express-validator');
const userController = require('../controllers/UserController');
const authenticate = require('../middlewares/auth');
const { requireSuperAdmin, requireAdminOrSuperAdmin, checkOwnership } = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['student', 'admin']).withMessage('Invalid role'),
  body('studentId').optional().notEmpty().withMessage('Student ID cannot be empty if provided'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const updateUserValidation = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date is required')
];

const userIdValidation = [
  param('id').isUUID().withMessage('Valid user ID is required')
];

const roleValidation = [
  param('role').isIn(['student', 'admin', 'super_admin']).withMessage('Invalid role')
];

// Routes
router.post('/', authenticate, requireSuperAdmin, createUserValidation, validate, auditLogger('create', 'user'), userController.createUser);
router.get('/', authenticate, requireSuperAdmin, userController.getAllUsers);
router.get('/stats', authenticate, requireSuperAdmin, userController.getUserStats);
router.get('/students', authenticate, requireAdminOrSuperAdmin, userController.getStudents);
router.get('/admins', authenticate, requireSuperAdmin, userController.getAdmins);
router.get('/role/:role', authenticate, requireAdminOrSuperAdmin, roleValidation, validate, userController.getUsersByRole);
router.get('/:id', authenticate, userIdValidation, validate, checkOwnership, userController.getUserById);
router.put('/:id', authenticate, userIdValidation, updateUserValidation, validate, checkOwnership, auditLogger('update', 'user'), userController.updateUser);
router.delete('/:id', authenticate, requireSuperAdmin, userIdValidation, validate, auditLogger('delete', 'user'), userController.deleteUser);

module.exports = router;
