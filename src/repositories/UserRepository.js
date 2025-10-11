const prisma = require('../infrastructure/prisma');

class UserRepository {
  async update(data, where) {
    // Convert dateOfBirth to Date object if present and is a valid string
    const userData = { ...data };
    if (userData.dateOfBirth !== undefined) {
      if (typeof userData.dateOfBirth === 'string' && userData.dateOfBirth.trim() !== '') {
        userData.dateOfBirth = new Date(userData.dateOfBirth);
      } else if (userData.dateOfBirth === '' || userData.dateOfBirth === null) {
        userData.dateOfBirth = null;
      }
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
    // Convert dateOfBirth to Date object if present and is a valid string
    const userData = { ...data };
    if (userData.dateOfBirth !== undefined) {
      if (typeof userData.dateOfBirth === 'string' && userData.dateOfBirth.trim() !== '') {
        userData.dateOfBirth = new Date(userData.dateOfBirth);
      } else if (userData.dateOfBirth === '' || userData.dateOfBirth === null) {
        userData.dateOfBirth = null;
      }
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

  async findByLecturerId(lecturerId) {
    return await prisma.user.findFirst({
      where: {
        lecturer: {
          lecturerId: lecturerId
        }
      }
    });
  }

  async findByRole(role, filter = {}, options = {}) {
    // options: { orderBy, take, skip }
    const { orderBy, take, skip } = options;
    // Remove invalid keys from filter
    const { where, order, limit, offset, ...flatFilter } = filter || {};
    // Merge all where conditions
    const mergedWhere = { role, ...(where || {}), ...flatFilter };
    return await prisma.user.findMany({
      where: mergedWhere,
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
          // Search the related Student record's studentNo (one-to-one relation)
          { student: { is: { studentNo: { contains: searchTerm, mode: 'insensitive' } } } }
        ]
      }
    });
  }

  /**
   * Search users for the student role by name, email or studentNo.
   * options: { orderBy, take, skip }
   */
  async searchStudents(searchTerm, filter = {}, options = {}) {
    const { orderBy, take, skip } = options || {};
    // Support multi-keyword searches (e.g., "john smi" or "john+smi").
    // Split incoming searchTerm into tokens and require that ALL tokens match
    // at least one of the searchable fields (firstName, lastName, email, student.studentNo).
    let where = { role: 'student', ...filter };

    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim() !== '') {
      // Normalize separators: plus signs from URL encoding and extra whitespace
      const normalized = searchTerm.replace(/\+/g, ' ').trim();
      const tokens = normalized.split(/\s+/).filter(t => t.length > 0);

      // Build AND of ORs: each token must match at least one field (case-insensitive)
      const andConditions = tokens.map(token => {
        return {
          OR: [
            { firstName: { contains: token, mode: 'insensitive' } },
            { lastName: { contains: token, mode: 'insensitive' } },
            { email: { contains: token, mode: 'insensitive' } },
            { student: { is: { studentNo: { contains: token, mode: 'insensitive' } } } }
          ]
        };
      });

      where = { ...where, AND: andConditions };
    }

    // If pagination (take/skip) or count is requested, return both rows and count
    const findArgs = {
      where,
      include: {},
      ...(orderBy ? { orderBy } : {}),
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {})
    };

    if (typeof take === 'number' || typeof skip === 'number') {
      const [rows, count] = await Promise.all([
        prisma.user.findMany(findArgs),
        prisma.user.count({ where })
      ]);
      return { rows, count };
    }

    return await prisma.user.findMany(findArgs);
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

  async delete(userId) {
    return await prisma.user.delete({ where: { id: userId } });
  }
}

module.exports = UserRepository;
