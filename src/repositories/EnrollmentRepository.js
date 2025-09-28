
const prisma = require('../infrastructure/prisma');

class EnrollmentRepository {
  async findById(id) {
    return await prisma.enrollment.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.enrollment.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.enrollment.create({ data });
  }

  async update(id, data) {
    return await prisma.enrollment.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.enrollment.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.enrollment.count({ where: filter });
  }

  async findByStudentAndOffering(studentId, classId) {
    return await prisma.enrollment.findFirst({ where: { studentId, classId } });
  }
}

module.exports = EnrollmentRepository;
