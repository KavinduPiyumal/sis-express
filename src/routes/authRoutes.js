

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/AuthController');
const getUploadMiddleware = require('../infrastructure/upload');
const upload = getUploadMiddleware();
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'admin', 'super_admin']).withMessage('Invalid role'),
  body('studentId').optional().notEmpty().withMessage('Student ID cannot be empty if provided')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];




// Existing routes
router.post('/register', registerValidation, validate, auditLogger('create', 'user'), authController.register);
router.post('/login', loginValidation, validate, auditLogger('login', 'user'), authController.login);
router.post('/logout', authenticate, auditLogger('logout', 'user'), authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.get('/presigned-url', authenticate, authController.getPresignedUrl);
router.get('/presigned-upload-url', authenticate, authController.getPresignedUploadUrl);
if (process.env.UPLOAD_DRIVER === 's3' && process.env.S3_IS_PRE_SIGNED === 'true') {
  // Pre-signed S3: expect profileImageKey in body, no multer
  router.put('/profile', authenticate, auditLogger('update', 'user'), authController.updateProfile);
} else {
  // Normal upload: use multer
  router.put('/profile', authenticate, upload.single('profileImage'), auditLogger('update', 'user'), authController.updateProfile);
}
router.put('/change-password', authenticate, changePasswordValidation, validate, auditLogger('change_password', 'user'), authController.changePassword);
// Send OTP for password change (must be authenticated)
router.post('/send-change-password-otp', authenticate, authController.sendChangePasswordOtp);
router.post('/verify-token', authController.verifyToken);

// Password reset routes
router.post('/forgot-password', [body('email').isEmail().withMessage('Valid email is required')], validate, authController.forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validate, authController.resetPassword);

module.exports = router;
