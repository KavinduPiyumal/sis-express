
const prisma = require('../infrastructure/prisma');

class CGPARepository {
  async findById(id) {
    return await prisma.cGPA.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.cGPA.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.cGPA.create({ data });
  }

  async update(id, data) {
    return await prisma.cGPA.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.cGPA.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.cGPA.count({ where: filter });
  }
}

module.exports = CGPARepository;
