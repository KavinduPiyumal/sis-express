
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
    const userData = { ...data };
    if (userData.uniRegistrationDate && typeof userData.uniRegistrationDate === 'string') {
      userData.uniRegistrationDate = new Date(userData.uniRegistrationDate);
    }
    return await prisma.student.create({ data: userData });
  }

  async update(id, data) {
    const userData = { ...data };
    if (userData.uniRegistrationDate && typeof userData.uniRegistrationDate === 'string') {
      userData.uniRegistrationDate = new Date(userData.uniRegistrationDate);
    }
    return await prisma.student.update({ where: { id }, data: userData });
  }

  async updateUsingUserId(userId, data) {
    const userData = { ...data };
    if (userData.uniRegistrationDate && typeof userData.uniRegistrationDate === 'string') {
      userData.uniRegistrationDate = new Date(userData.uniRegistrationDate);
    }
    return await prisma.student.update({ where: { userId }, data: userData });
  }

  async delete(id) {
    return await prisma.student.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.student.count({ where: filter });
  }
}

module.exports = StudentRepository;
