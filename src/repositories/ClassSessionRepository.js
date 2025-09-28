
const prisma = require('../infrastructure/prisma');

class ClassSessionRepository {
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
