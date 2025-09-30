
const prisma = require('../infrastructure/prisma');

class LecturerRepository {

  async findOne(filter = {}) {
    return await prisma.lecturer.findFirst({ where: filter });
  }
  async findById(id) {
    return await prisma.lecturer.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.lecturer.findMany({ where: filter });
  }

  async create(data) {
    // Ensure 'userId' is present and do not include a 'user' property
    if (!data.userId) {
      throw new Error("userId is required to create a Lecturer");
    }
    if(!data.lecturerId) {
      throw new Error("lecturerId is required to create a Lecturer");
    }
    const { user, ...lecturerData } = data;
    return await prisma.lecturer.create({ data: lecturerData });
  }

  async update(id, data) {
    return await prisma.lecturer.update({ where: { id }, data });
  }

  async updateUsingUserId(userId, data) {
    return await prisma.lecturer.update({ where: { userId }, data });
  }

  async delete(id) {
    return await prisma.lecturer.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.lecturer.count({ where: filter });
  }

}

module.exports = LecturerRepository;
