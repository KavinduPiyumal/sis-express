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
      
      res.json({
        success: true,
        message: 'Login successful',
        data: result
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

  updateProfile = async (req, res, next) => {
    try {
      const user = await this.authUseCase.updateProfile(req.user.id, req.body);
      
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
      const { currentPassword, newPassword } = req.body;
      const result = await this.authUseCase.changePassword(
        req.user.id,
        currentPassword,
        newPassword
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
      // In a stateless JWT implementation, logout is handled client-side
      // But we can log the logout action
      logger.info(`User ${req.user.id} logged out`);
      
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
}

module.exports = new AuthController();
