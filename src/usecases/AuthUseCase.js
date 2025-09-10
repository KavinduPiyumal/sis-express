const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { UserRepository } = require('../repositories');
const { UserDTO, UserCreateDTO, LoginDTO } = require('../dto/UserDTO');
const emailService = require('../infrastructure/emailService');
const logger = require('../config/logger');

class AuthUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Check if student ID already exists (for students)
      if (userData.studentId) {
        const existingStudentId = await this.userRepository.findByStudentId(userData.studentId);
        if (existingStudentId) {
          throw new Error('Student ID already exists');
        }
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user DTO
      const createUserDTO = new UserCreateDTO({
        ...userData,
        password: hashedPassword
      });

      // Create user
      const user = await this.userRepository.create(createUserDTO);

      // Send welcome email
      await emailService.sendWelcomeEmail(user);

      // Return user without password
      return new UserDTO(user);
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(loginData) {
    try {
      const { email, password } = new LoginDTO(loginData);

      // Find user by email
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      return {
        user: new UserDTO(user),
        token
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return new UserDTO(user);
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove password and sensitive fields from update data
      const { password, role, isActive, ...allowedUpdates } = updateData;

      const updatedUser = await this.userRepository.update(allowedUpdates, { id: userId });
      const refreshedUser = await this.userRepository.findById(userId);

      return new UserDTO(refreshedUser);
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await this.userRepository.update(
        { password: hashedNewPassword },
        { id: userId }
      );

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        throw new Error('Invalid token');
      }

      return new UserDTO(user);
    } catch (error) {
      logger.error('Token verification error:', error);
      throw error;
    }
  }

  // Forgot password: generate token, save to user, send email
  async forgotPassword(email, req) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // Do not reveal if user exists
      return;
    }
    // Generate secure token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    // Save token and expiry to user
    await this.userRepository.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(resetTokenExpiry)
    }, { id: user.id });
    // Send email
    await emailService.sendPasswordResetEmail(user, resetToken);
    logger.info(`Password reset email sent to ${user.email}`);
  }

  // Reset password: verify token, set new password
  async resetPassword(token, newPassword) {
    // Find user by token and expiry
    const user = await this.userRepository.model.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [require('sequelize').Op.gt]: new Date() }
      }
    });
    if (!user) {
      throw new Error('Invalid or expired reset token');
    }
    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    // Update password and clear token
    await this.userRepository.update({
      password: hashedNewPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }, { id: user.id });
    logger.info(`Password reset for user ${user.email}`);
  }
}

module.exports = AuthUseCase;
