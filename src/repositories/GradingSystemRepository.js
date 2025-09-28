
const prisma = require('../infrastructure/prisma');

class GradingSystemRepository {
  async findById(id) {
    return await prisma.gradingSystem.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.gradingSystem.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.gradingSystem.create({ data });
  }

  async update(id, data) {
    return await prisma.gradingSystem.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.gradingSystem.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.gradingSystem.count({ where: filter });
  }
}

module.exports = GradingSystemRepository;
