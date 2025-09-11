const AuthUseCase = require('../usecases/AuthUseCase');
const logger = require('../config/logger');

class AuthController {

  constructor() {
    this.authUseCase = new AuthUseCase();
  }

  register = async (req, res, next) => {
    try {
      const user = await this.authUseCase.register(req.body);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const result = await this.authUseCase.login(req.body);
      // Set JWT as HttpOnly cookie
      res.cookie('token', result.jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      });
      res.json({
        success: true,
        message: 'Login successful',
        data: result.user
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req, res, next) => {
    try {
      const user = await this.authUseCase.getProfile(req.user.id);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  // Pre-signed S3 download URL endpoint
  getPresignedUrl = (req, res, next) => {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Missing file key' });
    }
    try {
      const { getS3DownloadUrl } = require('../infrastructure/s3PresignedUrl');
      const url = getS3DownloadUrl(key);
      res.json({ success: true, url });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Failed to generate pre-signed URL', error: err.message });
    }
  };

  getPresignedUploadUrl = (req, res) => {
  const { key, fileType } = req.query;
  if (!key || !fileType) {
    return res.status(400).json({ success: false, message: 'Missing key or fileType' });
  }
  try {
    const { getS3UploadUrl } = require('../infrastructure/s3PresignedUrl');
    const url = getS3UploadUrl(key, fileType);
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to generate pre-signed upload URL', error: err.message });
  }
};

  updateProfile = async (req, res, next) => {
    try {
      // Merge req.body and file info if present
      const updateData = { ...req.body };
      if (req.file) {
        if (process.env.UPLOAD_DRIVER === 's3' && req.file.location) {
          // updateData.profileImage = req.file.location; // S3 URL
        } else {
          updateData.profileImage = req.file.filename; // Local filename
        }
      }
      const user = await this.authUseCase.updateProfile(req.user.id, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      const { currentPassword, newPassword, otp } = req.body;
      const result = await this.authUseCase.changePassword(
        req.user.id,
        currentPassword,
        newPassword,
        otp
      );

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      logger.info(`User ${req.user.id} logged out`);
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  };

  verifyToken = async (req, res, next) => {
    try {
      const { token } = req.body;
      const user = await this.authUseCase.verifyToken(token);

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req, res, next) => {
    try {
      await this.authUseCase.forgotPassword(req.body.email, req);
      res.json({
        success: true,
        message: 'If that email exists, a reset link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;
      await this.authUseCase.resetPassword(token, newPassword);
      res.json({
        success: true,
        message: 'Password has been reset successfully.'
      });
    } catch (error) {
      next(error);
    }
  };

  sendChangePasswordOtp = async (req, res, next) => {
    try {
      await this.authUseCase.sendChangePasswordOtp(req.user.id);
      res.json({
        success: true,
        message: 'OTP sent to your email.'
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AuthController();
