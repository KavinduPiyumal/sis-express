
const prisma = require('../infrastructure/prisma');

class SubjectRepository {
  async findById(id) {
    return await prisma.subject.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.subject.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.subject.create({ data });
  }

  async update(id, data) {
    return await prisma.subject.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.subject.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.subject.count({ where: filter });
  }
}

module.exports = SubjectRepository;
