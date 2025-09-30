
const prisma = require('../infrastructure/prisma');

class SemesterRepository {
  async findById(id) {
    return await prisma.semester.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.semester.findMany({ where: filter });
  }

  async create(data) {
    const semesterData = { ...data };
    if (semesterData.startDate && typeof semesterData.startDate === 'string') {
      semesterData.startDate = new Date(semesterData.startDate);
    }
    if (semesterData.endDate && typeof semesterData.endDate === 'string') {
      semesterData.endDate = new Date(semesterData.endDate);
    }
    return await prisma.semester.create({ data: semesterData });
  }

  async update(id, data) {
    const semesterData = { ...data };
    if (semesterData.startDate && typeof semesterData.startDate === 'string') {
      semesterData.startDate = new Date(semesterData.startDate);
    }
    if (semesterData.endDate && typeof semesterData.endDate === 'string') {
      semesterData.endDate = new Date(semesterData.endDate);
    }
    return await prisma.semester.update({ where: { id }, data: semesterData });
  }

  async delete(id) {
    return await prisma.semester.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.semester.count({ where: filter });
  }
}

module.exports = SemesterRepository;
