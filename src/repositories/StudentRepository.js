const prisma = require('../infrastructure/prisma');

class StudentRepository {
  async findByStudentNo(studentNo) {
    return await prisma.student.findUnique({ where: { studentNo } });
  }
  async findOne(filter = {}) {
    return await prisma.student.findFirst({ where: filter });
  }
  async findById(id) {
    return await prisma.student.findUnique({ where: { id } });
  }

  // `options` can include Prisma query options such as `include`, `select`, `orderBy`, etc.
  async findAll(filter = {}, options = {}) {
    const query = { where: filter, ...options };
    return await prisma.student.findMany(query);
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
