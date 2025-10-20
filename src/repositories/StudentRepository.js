const prisma = require('../infrastructure/prisma');

class StudentRepository {
  async findByLecturer(lecturerId) {
    // Find all students enrolled in course offerings taught by this lecturer
    // This assumes Enrollment and CourseOffering relations are set up in Prisma
    // Returns unique students
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseOffering: {
          lecturerId: lecturerId
        }
      },
      select: {
        studentId: true
      }
    });
    const studentIds = [...new Set(enrollments.map(e => e.studentId))];
    if (studentIds.length === 0) return [];
    return await prisma.student.findMany({ where: { id: { in: studentIds } } });
  }
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
