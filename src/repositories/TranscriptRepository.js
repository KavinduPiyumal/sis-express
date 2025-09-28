
const prisma = require('../infrastructure/prisma');

class TranscriptRepository {
  async findById(id) {
    return await prisma.transcript.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.transcript.findMany({ where: filter });
  }

  async create(data) {
    return await prisma.transcript.create({ data });
  }

  async update(id, data) {
    return await prisma.transcript.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.transcript.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.transcript.count({ where: filter });
  }
}

module.exports = TranscriptRepository;
