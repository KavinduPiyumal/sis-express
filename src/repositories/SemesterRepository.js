
const prisma = require('../infrastructure/prisma');

class SemesterRepository {
  async findById(id) {
    return await prisma.semester.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.semester.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.semester.create({ data });
  }

  async update(id, data) {
    return await prisma.semester.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.semester.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.semester.count({ where: filter });
  }
}

module.exports = SemesterRepository;
