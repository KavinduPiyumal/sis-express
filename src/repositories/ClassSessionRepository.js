
const prisma = require('../infrastructure/prisma');

class ClassSessionRepository {
  async findUpcomingForLecturer(lecturerId, limit = 3) {
    // Find upcoming class sessions for a lecturer (future sessions, ordered by date)
    const now = new Date();
    return await prisma.classSession.findMany({
      where: {
        courseOffering: {
          lecturerId: lecturerId
        },
        date: {
          gte: now
        }
      },
      include: {
        courseOffering: {
          select: {
            year: true,
            subject: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { date: 'asc' },
      take: limit
    });
  }
  async findById(id) {
    return await prisma.classSession.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.classSession.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.classSession.create({ data });
  }

  async update(id, data) {
    return await prisma.classSession.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.classSession.delete({ where: { id } });
  }
}

module.exports = ClassSessionRepository;
