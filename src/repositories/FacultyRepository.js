
const prisma = require('../infrastructure/prisma');

class FacultyRepository {
  async findById(id) {
    return await prisma.faculty.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.faculty.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.faculty.create({ data });
  }

  async update(id, data) {
    return await prisma.faculty.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.faculty.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.faculty.count({ where: filter });
  }
}

module.exports = FacultyRepository;
