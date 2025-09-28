
const prisma = require('../infrastructure/prisma');

class DegreeProgramRepository {
  async findById(id) {
    return await prisma.degreeProgram.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.degreeProgram.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.degreeProgram.create({ data });
  }

  async update(id, data) {
    return await prisma.degreeProgram.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.degreeProgram.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.degreeProgram.count({ where: filter });
  }
}

module.exports = DegreeProgramRepository;
