
const prisma = require('../infrastructure/prisma');

class StudentRepository {
  async findOne(filter = {}) {
    return await prisma.student.findFirst({ where: filter });
  }
  async findById(id) {
    return await prisma.student.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.student.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.student.create({ data });
  }

  async update(id, data) {
    return await prisma.student.update({ where: { id }, data });
  }

  async updateUsingUserId(userId, data) {
    return await prisma.student.update({ where: { userId }, data });
  }

  async delete(id) {
    return await prisma.student.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.student.count({ where: filter });
  }
}

module.exports = StudentRepository;
