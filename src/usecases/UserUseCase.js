const bcrypt = require('bcryptjs');
const { UserRepository } = require('../repositories');
const { UserDTO, UserCreateDTO, UserUpdateDTO } = require('../dto/UserDTO');
const emailService = require('../infrastructure/emailService');
const logger = require('../config/logger');

class UserUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData, creatorRole) {
    try {
      // Only super admins can create users
      if (creatorRole !== 'super_admin') {
        throw new Error('Only super admins can create users');
      }

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

      // Generate temporary password if not provided
      const tempPassword = userData.password || this.generateTempPassword();

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

      // Create user DTO
      const createUserDTO = new UserCreateDTO({
        ...userData,
        password: hashedPassword
      });

      // Create user
      const user = await this.userRepository.create(createUserDTO);

      // Send welcome email with temporary password
      await emailService.sendWelcomeEmail(user, userData.password ? null : tempPassword);

      return new UserDTO(user);
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async getAllUsers(role, options = {}) {
    try {
      // Only super admins can view all users
      if (role !== 'super_admin') {
        throw new Error('Only super admins can view all users');
      }

      const { page = 1, limit = 10, search, roleFilter } = options;
      const offset = (page - 1) * limit;

      let users;
      if (search) {
        users = await this.userRepository.searchUsers(search, {
          limit: parseInt(limit),
          offset,
          order: [['createdAt', 'DESC']]
        });
      } else {
        const whereClause = roleFilter ? { role: roleFilter } : {};
        users = await this.userRepository.findAndCountAll({
          where: whereClause,
          limit: parseInt(limit),
          offset,
          order: [['createdAt', 'DESC']]
        });
      }

      return {
        users: users.rows.map(user => new UserDTO(user)),
        totalCount: users.count,
        totalPages: Math.ceil(users.count / limit),
        currentPage: parseInt(page)
      };
    } catch (error) {
      logger.error('Get all users error:', error);
      throw error;
    }
  }

  async getUsersByRole(requestorRole, targetRole) {
    try {
      // Super admins can view any role, admins can view students
      if (requestorRole !== 'super_admin' && !(requestorRole === 'admin' && targetRole === 'student')) {
        throw new Error('Insufficient permissions');
      }

      const users = await this.userRepository.findByRole(targetRole, {
        where: { isActive: true },
        order: [['firstName', 'ASC']]
      });

      return users.map(user => new UserDTO(user));
    } catch (error) {
      logger.error('Get users by role error:', error);
      throw error;
    }
  }

  async getUserById(userId, requestorId, requestorRole) {
    try {
      // Users can view their own profile, super admins can view anyone, admins can view students
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const canAccess = 
        userId === requestorId ||
        requestorRole === 'super_admin' ||
        (requestorRole === 'admin' && user.role === 'student');

      if (!canAccess) {
        throw new Error('Insufficient permissions');
      }

      return new UserDTO(user);
    } catch (error) {
      logger.error('Get user by ID error:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData, requestorId, requestorRole) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check permissions
      const canUpdate = 
        userId === requestorId ||
        requestorRole === 'super_admin' ||
        (requestorRole === 'admin' && user.role === 'student');

      if (!canUpdate) {
        throw new Error('Insufficient permissions');
      }

      // Restrict what can be updated based on role
      let allowedUpdates = { ...updateData };
      
      if (requestorRole !== 'super_admin') {
        // Non-super admins cannot change role or activation status
        delete allowedUpdates.role;
        delete allowedUpdates.isActive;
      }

      // Remove sensitive fields
      delete allowedUpdates.password;
      delete allowedUpdates.id;

      const updateUserDTO = new UserUpdateDTO(allowedUpdates);
      
      await this.userRepository.update(updateUserDTO, { id: userId });
      const updatedUser = await this.userRepository.findById(userId);

      return new UserDTO(updatedUser);
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId, requestorRole) {
    try {
      // Only super admins can delete users
      if (requestorRole !== 'super_admin') {
        throw new Error('Only super admins can delete users');
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Soft delete by deactivating
      await this.userRepository.deactivateUser(userId);

      return { message: 'User deleted successfully' };
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }

  async getUserStats(requestorRole) {
    try {
      if (requestorRole !== 'super_admin') {
        throw new Error('Only super admins can view user statistics');
      }

      return await this.userRepository.getUserStats();
    } catch (error) {
      logger.error('Get user stats error:', error);
      throw error;
    }
  }

  generateTempPassword() {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

module.exports = UserUseCase;
