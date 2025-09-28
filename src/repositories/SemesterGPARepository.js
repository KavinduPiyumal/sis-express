
const prisma = require('../infrastructure/prisma');

class SemesterGPARepository {
  async findById(id) {
    return await prisma.semesterGPA.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.semesterGPA.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.semesterGPA.create({ data });
  }

  async update(id, data) {
    return await prisma.semesterGPA.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.semesterGPA.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.semesterGPA.count({ where: filter });
  }
}

module.exports = SemesterGPARepository;
