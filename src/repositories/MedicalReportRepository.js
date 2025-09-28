
const prisma = require('../infrastructure/prisma');

class MedicalReportRepository {
  async findById(id) {
    return await prisma.medicalReport.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.medicalReport.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.medicalReport.create({ data });
  }

  async update(id, data) {
    return await prisma.medicalReport.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.medicalReport.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.medicalReport.count({ where: filter });
  }
}

module.exports = MedicalReportRepository;
