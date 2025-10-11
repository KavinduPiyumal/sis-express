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
   * @param {Object} options - additional options like include
   */
  async findByFilters(filters = {}, options = {}) {
    const defaultInclude = {
      subject: true,
      semester: true,
      batch: {
        include: {
          program: {
            include: {
              faculty: true,
              department: true
            }
          }
        }
      },
      lecturer: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          department: true
        }
      }
    };
    
    // Support pagination via options.skip and options.take
    const query = {
      where: filters,
      include: options.include || defaultInclude,
    };

    if (typeof options.skip !== 'undefined') query.skip = options.skip;
    if (typeof options.take !== 'undefined') query.take = options.take;
    if (options.orderBy) query.orderBy = options.orderBy;

    return await prisma.courseOffering.findMany(query);
  }

  async count(filter = {}) {
    return await prisma.courseOffering.count({ where: filter });
  }
}

module.exports = CourseOfferingRepository;
