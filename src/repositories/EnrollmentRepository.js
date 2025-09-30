
const prisma = require('../infrastructure/prisma');

class EnrollmentRepository {
  async findById(id) {
    return await prisma.enrollment.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.enrollment.findMany({ where: filter });
  }

  async create(data) {
    const enrollmentData = { ...data };
    if (enrollmentData.enrolledDate && typeof enrollmentData.enrolledDate === 'string') {
      enrollmentData.enrolledDate = new Date(enrollmentData.enrolledDate);
    }
    return await prisma.enrollment.create({ data: enrollmentData });
  }

  async update(id, data) {
    const enrollmentData = { ...data };
    if (enrollmentData.enrolledDate && typeof enrollmentData.enrolledDate === 'string') {
      enrollmentData.enrolledDate = new Date(enrollmentData.enrolledDate);
    }
    return await prisma.enrollment.update({ where: { id }, data: enrollmentData });
  }

  async delete(id) {
    return await prisma.enrollment.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.enrollment.count({ where: filter });
  }

  async findByStudentAndOffering(studentId, courseOfferingId) {
    return await prisma.enrollment.findFirst({ where: { studentId, courseOfferingId } });
  }
}

module.exports = EnrollmentRepository;
