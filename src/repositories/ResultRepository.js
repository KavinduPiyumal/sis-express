const prisma = require('../infrastructure/prisma');

class ResultRepository {
  async create(data) {
    return await prisma.result.create({ data });
  }

  async findAll(filter = {}) {
    return await prisma.result.findMany({ where: filter });
  }

  async findById(id) {
    return await prisma.result.findUnique({ where: { id } });
  }

  async update(id, data) {
    return await prisma.result.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.result.delete({ where: { id } });
  }

  /**
   * Find results by dynamic filters (e.g., studentId, courseOfferingId, enteredBy)
   * @param {Object} filters - key-value pairs for filtering
   * @param {Object} options - additional options like include
   */
  async findByFilters(filters = {}, options = {}) {
    const defaultInclude = {
      student: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          batch: {
            include: {
              program: {
                include: {
                  faculty: true,
                  department: true
                }
              }
            }
          }
        }
      },
      courseOffering: {
        include: {
          subject: true,
          semester: true,
          batch: true,
          lecturer: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      },
      enteredByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    };
    
    // Handle nested filters (like courseOffering.semesterId)
    let whereClause = {};
    
    if (filters.courseOffering && filters.courseOffering.semesterId) {
      whereClause = {
        ...filters,
        courseOffering: {
          semesterId: filters.courseOffering.semesterId
        }
      };
      // Remove the nested courseOffering from the main filters
      delete whereClause.courseOffering.semesterId;
      if (Object.keys(whereClause.courseOffering).length === 0) {
        delete whereClause.courseOffering;
      }
    } else {
      whereClause = filters;
    }
    
    return await prisma.result.findMany({ 
      where: whereClause,
      include: options.include || defaultInclude,
      orderBy: options.orderBy || { enteredAt: 'desc' }
    });
  }

  /**
   * Find results by student ID with course offering details
   * @param {string} studentId 
   */
  async findByStudentId(studentId) {
    return await this.findByFilters({ studentId });
  }

  /**
   * Find results by course offering ID with student details
   * @param {string} courseOfferingId 
   */
  async findByCourseOfferingId(courseOfferingId) {
    return await this.findByFilters({ courseOfferingId });
  }

  /**
   * Find results by lecturer (through course offering)
   * @param {string} lecturerId 
   */
  async findByLecturerId(lecturerId) {
    return await prisma.result.findMany({
      where: {
        courseOffering: {
          lecturerId: lecturerId
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        courseOffering: {
          include: {
            subject: true,
            semester: true,
            batch: true
          }
        },
        enteredByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { enteredAt: 'desc' }
    });
  }

  /**
   * Check if result already exists for student and course offering
   * @param {string} studentId 
   * @param {string} courseOfferingId 
   */
  async findExisting(studentId, courseOfferingId) {
    return await prisma.result.findFirst({
      where: {
        studentId,
        courseOfferingId
      }
    });
  }

  async count(filter = {}) {
    return await prisma.result.count({ where: filter });
  }

  /**
   * Get results statistics for a course offering
   * @param {string} courseOfferingId 
   */
  async getStatistics(courseOfferingId) {
    const results = await prisma.result.findMany({
      where: { courseOfferingId },
      select: { marks: true, grade: true, gradePoint: true }
    });

    if (results.length === 0) {
      return {
        totalStudents: 0,
        averageMarks: 0,
        highestMarks: 0,
        lowestMarks: 0,
        passCount: 0,
        failCount: 0
      };
    }

    const marks = results.map(r => parseFloat(r.marks));
    const passCount = results.filter(r => parseFloat(r.marks) >= 40).length; // Assuming 40 is pass mark
    
    return {
      totalStudents: results.length,
      averageMarks: marks.reduce((a, b) => a + b, 0) / marks.length,
      highestMarks: Math.max(...marks),
      lowestMarks: Math.min(...marks),
      passCount,
      failCount: results.length - passCount
    };
  }
}

module.exports = ResultRepository;