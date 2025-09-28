const prisma = require('../infrastructure/prisma');

class UserRepository {
  async update(data, where) {
    // Convert dateOfBirth to Date object if present and is a string
    const userData = { ...data };
    if (userData.dateOfBirth && typeof userData.dateOfBirth === 'string') {
      userData.dateOfBirth = new Date(userData.dateOfBirth);
    }
    return await prisma.user.update({
      where,
      data: userData
    });
  }
  async findByUsername(username) {
    return await prisma.user.findUnique({ where: { username } });
  }
  async create(data) {
    // Convert dateOfBirth to Date object if present and is a string
    const userData = { ...data };
    if (userData.dateOfBirth && typeof userData.dateOfBirth === 'string') {
      userData.dateOfBirth = new Date(userData.dateOfBirth);
    }
    return await prisma.user.create({ data: userData });
  }
  async findById(id) {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email) {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findByStudentId(studentId) {
    return await prisma.user.findFirst({
      where: {
        student: {
          studentNo: studentId
        }
      }
    });
  }

  async findByRole(role, filter = {}, options = {}) {
    // options: { orderBy, take, skip }
    const { orderBy, take, skip } = options;
    // Remove invalid keys from filter
    const { where, order, limit, offset, ...flatFilter } = filter || {};
    return await prisma.user.findMany({
      where: { role, ...flatFilter },
      ...(orderBy ? { orderBy } : {}),
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {})
    });
  }

  async findActiveUsers(filter = {}) {
    return await prisma.user.findMany({ where: { isActive: true, ...filter } });
  }

  async searchUsers(searchTerm) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: 'insensitive' } },
          { lastName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { studentId: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    });
  }

  async updateLastLogin(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() }
    });
  }

  async deactivateUser(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });
  }

  async activateUser(userId) {
    return await prisma.user.update({
      where: { id: userId },
      data: { isActive: true }
    });
  }

  async getUserStats() {
    const [totalUsers, activeUsers, studentCount, adminCount, superAdminCount] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'super_admin' } })
    ]);
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
