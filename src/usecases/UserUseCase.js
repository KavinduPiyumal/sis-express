
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
    const prisma = require('../infrastructure/prisma');
    if (creatorRole !== 'super_admin') {
      throw new Error('Only super admins can create users');
    }
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Use repositories with transaction client if possible
        const UserRepository = require('../repositories/UserRepository');
        const StudentRepository = require('../repositories/StudentRepository');
        const LecturerRepository = require('../repositories/LecturerRepository');
        const userRepository = new UserRepository(tx);
        const studentRepo = new StudentRepository(tx);
        const lecturerRepo = new LecturerRepository(tx);

        // Check if user already exists
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Check if studentNo already exists (for students)
        if (userData.role === 'student' && userData.studentNo) {
          const existingStudentNo = await userRepository.findByStudentId(userData.studentNo);
          if (existingStudentNo) {
            throw new Error('Student number already exists');
          }
        }

        if (userData.role === 'admin' && userData.lecturerId) {
          const existingLecturer = await userRepository.findByLecturerId(userData.lecturerId);
          if (existingLecturer) {
            throw new Error('Lecturer ID already exists');
          }
        }


        // Generate temporary password if not provided
        const tempPassword = userData.password || this.generateTempPassword();

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);

        // Generate username from email if not provided
        let username = userData.username;
        if (!username && userData.email) {
          username = userData.email;
        }

        // Create user DTO
        const createUserDTO = new UserCreateDTO({
          ...userData,
          username,
          password: hashedPassword,
          gender: userData.gender || null
        });

        // Create user (Prisma)
        const user = await userRepository.create(createUserDTO);

        // Create student or lecturer record if needed
        try {
          if (userData.role === 'student') {
            await studentRepo.create({
              userId: user.id,
              studentNo: userData.studentNo,
              batchId: userData.batchId,
              status: 'active',
              parentName: userData.parentName || null,
              parentPhone: userData.parentPhone || null,
              emergencyContactName: userData.emergencyContactName || null,
              emergencyContactPhone: userData.emergencyContactPhone || null,
              uniRegistrationDate: userData.uniRegistrationDate || null
            });
          } 
          else if (userData.role === 'admin') {
            await lecturerRepo.create({
              userId: user.id,
              lecturerId: userData.lecturerId || null,
              departmentId: userData.departmentId || null,
              emergencyContactName: userData.emergencyContactName || null,
              emergencyContactPhone: userData.emergencyContactPhone || null,
            });
          }
        } catch (relatedError) {
          // If related record creation fails, delete the user to maintain consistency
          await userRepository.delete(user.id);
          throw relatedError;
        }
        // For super_admin, no extra record

        // Return user and tempPassword for email sending after transaction
        return { user, tempPassword: userData.password ? null : tempPassword };
      });
      // Send welcome email after transaction
      await emailService.sendWelcomeEmail(result.user, result.tempPassword);
      return new UserDTO(result.user);
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

      // Always expect options as third argument (controller should pass req.query)
      const options = arguments[2] && typeof arguments[2] === 'object' ? arguments[2] : {};
      let limit = options.limit !== undefined ? parseInt(options.limit) : 5;
      let page = options.page !== undefined ? parseInt(options.page) : 1;

      // Only apply limit for students if limit is set
      let userQueryOptions = {
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      };
      if (targetRole === 'student' || targetRole === 'admin') {
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

      // If students, return stats from Student collection using Prisma
      if (targetRole === 'student') {
        const { StudentRepository } = require('../repositories');
        const studentRepo = new StudentRepository();
        // Count all students with active users
        const total = await studentRepo.count({ user: { isActive: true } });
        const active = await studentRepo.count({ user: { isActive: true }, status: 'active' });
        const inactive = await studentRepo.count({ user: { isActive: true }, status: 'inactive' });
        const deleted = await studentRepo.count({ user: { isActive: false } });
        return {
          students: results,
          stats: {
            total,
            active,
            inactive,
            deleted
          }
        };
      }
      if (targetRole === 'admin') {
        const { LecturerRepository } = require('../repositories');
        const lecturerRepo = new LecturerRepository();
        // Count all lecturers with active users
        const total = await lecturerRepo.count({ user: { isActive: true } });
        const active = await lecturerRepo.count({ user: { isActive: true }, status: 'active' });
        const inactive = await lecturerRepo.count({ user: { isActive: true }, status: 'inactive' });
        const deleted = await lecturerRepo.count({ user: { isActive: false } });
        return {
          lecturers: results,
          stats: {
            total,
            active,
            inactive,
            deleted
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
          if (updateData.uniRegistrationDate !== undefined) studentFields.uniRegistrationDate = updateData.uniRegistrationDate;
          if (updateData.parentName !== undefined) studentFields.parentName = updateData.parentName;
          if (updateData.parentPhone !== undefined) studentFields.parentPhone = updateData.parentPhone;
          if (updateData.emergencyContactName !== undefined) studentFields.emergencyContactName = updateData.emergencyContactName;
          if (updateData.emergencyContactPhone !== undefined) studentFields.emergencyContactPhone = updateData.emergencyContactPhone;
          if (Object.keys(studentFields).length > 0) {
            await studentRepo.update(studentProfile.id, studentFields);
          }
        }
      } else if (user.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        const lecturerRepo = new LecturerRepository();
        const lecturerProfile = await lecturerRepo.findOne({ userId });
        if (lecturerProfile) {
          const lecturerFields = {};
          if (updateData.departmentId) lecturerFields.departmentId = updateData.departmentId;
          if (Object.keys(lecturerFields).length > 0) {
            await lecturerRepo.update(lecturerProfile.id, lecturerFields);
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
          await studentRepo.update(studentProfile.id, { status: 'inactive' });
        }
      } else if (user.role === 'admin') {
        const { LecturerRepository } = require('../repositories');
        const lecturerRepo = new LecturerRepository();
        const lecturerProfile = await lecturerRepo.findOne({ userId });
        if (lecturerProfile) {
          // No status field, so just set email to null or handle as needed
          // await lecturerRepo.update(lecturerProfile.id, { email: null });
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
