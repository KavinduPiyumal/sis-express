
const prisma = require('../infrastructure/prisma');

class DegreeProgramRepository {
  async findById(id) {
    return await prisma.degreeProgram.findUnique({ where: { id } });
  }

  async findAll(filter = {}) {
    return await prisma.degreeProgram.findMany({ where: filter });
  }

  /**
   * Find degree programs with optional pagination and ordering.
   * options: { orderBy, take, skip }
   * When take/skip provided, returns { rows, count }
   */
  async findAllWithOptions(filter = {}, options = {}) {
    const { orderBy, take, skip } = options;
    const findArgs = {
      where: filter,
      ...(orderBy ? { orderBy } : {}),
      ...(typeof take === 'number' ? { take } : {}),
      ...(typeof skip === 'number' ? { skip } : {})
    };

    if (typeof take === 'number' || typeof skip === 'number') {
      const [rows, count] = await Promise.all([
        prisma.degreeProgram.findMany(findArgs),
        prisma.degreeProgram.count({ where: filter })
      ]);
      return { rows, count };
    }

    return await prisma.degreeProgram.findMany(findArgs);
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
