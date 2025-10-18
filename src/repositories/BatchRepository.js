const prisma = require('../infrastructure/prisma');

class BatchRepository {
  async findById(id) {
    return await prisma.batch.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.batch.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.batch.create({ data });
  }

  async update(id, data) {
    return await prisma.batch.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.batch.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.batch.count({ where: filter });
  }
}

module.exports = BatchRepository;
