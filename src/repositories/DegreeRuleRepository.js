
const prisma = require('../infrastructure/prisma');

class DegreeRuleRepository {
  async findById(id) {
    return await prisma.degreeRule.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.degreeRule.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.degreeRule.create({ data });
  }

  async update(id, data) {
    return await prisma.degreeRule.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.degreeRule.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.degreeRule.count({ where: filter });
  }
}

module.exports = DegreeRuleRepository;
