const prisma = require('../infrastructure/prisma');

class CourseOfferingRepository {
  async create(data) {
    return await prisma.courseOffering.create({ data });
  }

  async findAll(filter = {}) {
    return await prisma.courseOffering.findMany({ where: filter });
  }

  async findById(id) {
    return await prisma.courseOffering.findUnique({ where: { id } });
  }

  async update(id, data) {
    return await prisma.courseOffering.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.courseOffering.delete({ where: { id } });
  }

  /**
   * Find course offerings by dynamic filters (e.g., lecturerId, subjectId, batchId, semesterId)
   * @param {Object} filters - key-value pairs for filtering
   */
  async findByFilters(filters = {}) {
    return await prisma.courseOffering.findMany({ where: filters });
  }

  async count(filter = {}) {
    return await prisma.courseOffering.count({ where: filter });
  }
}

module.exports = CourseOfferingRepository;
