
const bcrypt = require('bcryptjs');
const { UserRepository } = require('../repositories');
const { UserDTO, UserCreateDTO, UserUpdateDTO } = require('../dto/UserDTO');
const emailService = require('../infrastructure/emailService');
const logger = require('../config/logger');
const { sequelize } = require('../infrastructure/database');

class UserUseCase {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async createUser(userData, creatorRole, extTransaction = null) {
    const t = extTransaction || await sequelize.transaction();
    let createdHere = !extTransaction;
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
      if (userData.role === 'student' && userData.studentId) {
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
        password: hashedPassword,
        gender: userData.gender || null
      });

      // Create user
  const user = await this.userRepository.model.create(createUserDTO, { transaction: t });

      // Create student or lecturer record if needed
      if (userData.role === 'student') {
        const { StudentRepository } = require('../repositories');
        await new StudentRepository().model.create({
          userId: user.id,
          studentNo: userData.studentId,
          fullName: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          batchId: userData.batchId,
          status: 'active',
          parentName: userData.parentName || null,
          parentPhone: userData.parentPhone || null,
          emergencyContactName: userData.emergencyContactName || null,
          emergencyContactPhone: userData.emergencyContactPhone || null
        }, { transaction: t });
      } else if (userData.role === 'admin') {
        // Only create lecturer if not super_admin
        if (userData.isLecturer) {
          const { LecturerRepository } = require('../repositories');
          await new LecturerRepository().model.create({
            userId: user.id,
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            departmentId: userData.departmentId || null
          }, { transaction: t });
        }
      }
      // For super_admin, no extra record

      // Commit transaction
  if (createdHere) await t.commit();

      // Send welcome email with temporary password
      await emailService.sendWelcomeEmail(user, userData.password ? null : tempPassword);

      return new UserDTO(user);
    } catch (error) {
  if (createdHere) await t.rollback();
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

      // Always expect options as third argument (controller should pass req.query)
      const options = arguments[2] && typeof arguments[2] === 'object' ? arguments[2] : {};
      let limit = options.limit !== undefined ? parseInt(options.limit) : 5;
      let page = options.page !== undefined ? parseInt(options.page) : 1;

      // Only apply limit for students if limit is set
      let userQueryOptions = {
        where: { isActive: true },
        order: [['firstName', 'ASC']]
      };
      if (targetRole === 'student') {
        if (options.limit !== undefined && options.limit !== null && options.limit !== '') {
          userQueryOptions.limit = limit;
          userQueryOptions.offset = ((page - 1) * limit);
        }
      }

      const usersResult = await this.userRepository.findByRole(targetRole, userQueryOptions);
      // Support both array and paginated result
      const users = Array.isArray(usersResult) ? usersResult : (usersResult.rows || []);

      // Attach related Lecturer or Student record for each user
      let relatedRepo = null;
      if (targetRole === 'student') {
        const { StudentRepository } = require('../repositories');
        relatedRepo = new StudentRepository();
      } else if (targetRole === 'admin') {
        const { LecturerRepository } = require('../repositories');
        relatedRepo = new LecturerRepository();
      }

      const results = await Promise.all(users.map(async user => {
        let profile = null;
        if (relatedRepo) {
          profile = await relatedRepo.findOne({ userId: user.id });
        }
        return { ...new UserDTO(user), profile };
      }));

      // If students, return stats from Student collection
      if (targetRole === 'student') {
        // Get stats from Student collection
        const { Student } = require('../entities');
        const total = await Student.count();
        const active = await Student.count({ where: { status: 'active' } });
        const inactive = await Student.count({ where: { status: 'inactive' } });
        return {
          students: results,
          stats: {
            total,
            active,
            inactive
          }
        };
      }

      return results;
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

      // Fetch student/lecturer profile if applicable
      let profile = null;
      if (user.role === 'student') {
        const { StudentRepository } = require('../repositories');
        profile = await new StudentRepository().findOne({ userId: user.id });
      } else if (user.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        profile = await new LecturerRepository().findOne({ userId: user.id });
      }

      const userDto = new UserDTO(user);
      return { ...userDto, profile };
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

      // Update student/lecturer profile if relevant fields are present
      if (user.role === 'student') {
        const { StudentRepository } = require('../repositories');
        const studentRepo = new StudentRepository();
        const studentProfile = await studentRepo.findOne({ userId });
        if (studentProfile) {
          const studentFields = {};
          if (updateData.batchId) studentFields.batchId = updateData.batchId;
          if (updateData.status) studentFields.status = updateData.status;
          if (updateData.fullName) studentFields.fullName = updateData.fullName;
          if (updateData.email) studentFields.email = updateData.email;
          if (Object.keys(studentFields).length > 0) {
            await studentRepo.update(studentFields, { userId });
          }
        }
      } else if (user.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        const lecturerRepo = new LecturerRepository();
        const lecturerProfile = await lecturerRepo.findOne({ userId });
        if (lecturerProfile) {
          const lecturerFields = {};
          if (updateData.departmentId) lecturerFields.departmentId = updateData.departmentId;
          if (updateData.fullName) lecturerFields.fullName = updateData.fullName;
          if (updateData.email) lecturerFields.email = updateData.email;
          if (Object.keys(lecturerFields).length > 0) {
            await lecturerRepo.update(lecturerFields, { userId });
          }
        }
      }

      const updatedUser = await this.userRepository.findById(userId);
      // Return with profile
      let profile = null;
      if (updatedUser.role === 'student') {
        const { StudentRepository } = require('../repositories');
        profile = await new StudentRepository().findOne({ userId });
      } else if (updatedUser.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        profile = await new LecturerRepository().findOne({ userId });
      }
      const userDto = new UserDTO(updatedUser);
      return { ...userDto, profile };
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

      // Soft delete by deactivating user
      await this.userRepository.deactivateUser(userId);

      // Also deactivate student/lecturer profile if exists
      if (user.role === 'student') {
        const { StudentRepository } = require('../repositories');
        const studentRepo = new StudentRepository();
        const studentProfile = await studentRepo.findOne({ userId });
        if (studentProfile) {
          await studentRepo.update({ status: 'inactive' }, { userId });
        }
      } else if (user.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        const lecturerRepo = new LecturerRepository();
        const lecturerProfile = await lecturerRepo.findOne({ userId });
        if (lecturerProfile) {
          // No status field, so just set email to null or handle as needed
          await lecturerRepo.update({ email: null }, { userId });
        }
      }

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
