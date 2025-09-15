const BaseRepository = require('./BaseRepository');
const { User } = require('../entities');
const { Op } = require('sequelize');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByStudentId(studentId) {
    return await this.findOne({ studentId });
  }

  async findByRole(role, options = {}) {
    // Merge role and any additional where filters
    const where = { role, ...(options.where || {}) };
    const opts = { ...options, where };
    return await this.findAll(opts);
  }

  async findActiveUsers(options = {}) {
    return await this.findAll({ where: { isActive: true }, ...options });
  }

  async searchUsers(searchTerm, options = {}) {
    const where = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchTerm}%` } },
        { lastName: { [Op.iLike]: `%${searchTerm}%` } },
        { email: { [Op.iLike]: `%${searchTerm}%` } },
        { studentId: { [Op.iLike]: `%${searchTerm}%` } }
      ]
    };
    return await this.findAll({ where, ...options });
  }

  async updateLastLogin(userId) {
    return await this.update(
      { lastLoginAt: new Date() },
      { id: userId }
    );
  }

  async deactivateUser(userId) {
    return await this.update(
      { isActive: false },
      { id: userId }
    );
  }

  async activateUser(userId) {
    return await this.update(
      { isActive: true },
      { id: userId }
    );
  }

  async getUserStats() {
    const totalUsers = await this.count();
    const activeUsers = await this.count({ isActive: true });
    const studentCount = await this.count({ role: 'student' });
    const adminCount = await this.count({ role: 'admin' });
    const superAdminCount = await this.count({ role: 'super_admin' });

    return {
      total: totalUsers,
      active: activeUsers,
      students: studentCount,
      admins: adminCount,
      superAdmins: superAdminCount
    };
  }
}

module.exports = UserRepository;
