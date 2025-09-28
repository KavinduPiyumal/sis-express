
const prisma = require('../infrastructure/prisma');

class LecturerRepository {
  async findById(id) {
    return await prisma.lecturer.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.lecturer.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.lecturer.create({ data });
  }

  async update(id, data) {
    return await prisma.lecturer.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.lecturer.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.lecturer.count({ where: filter });
  }
}

module.exports = LecturerRepository;
