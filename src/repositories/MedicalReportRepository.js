
const prisma = require('../infrastructure/prisma');

class MedicalReportRepository {
  async getMedicalReportsForAdminCourseOfferings(lecturerId, options = {}) {
    // Find all medical reports for course offerings assigned to this lecturer
    // Assumes courseOffering.lecturerId is available in medicalReport's relations
    return await prisma.medicalReport.findMany({
      where: {
        classSession: {
          courseOffering: {
            lecturerId: lecturerId
          }
        }
      },
      ...options
    });
  }
  async findById(id) {
    return await prisma.medicalReport.findUnique({
      where: { id },
      include: {
        attachments: true,
        attendances: true,
        student: {
          include: {
            user: true
          }
        },
        classSession: {
          include: {
            courseOffering: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });
  }

  async findAll(filter = {}) {
    // Accepts filter as a plain object, not { where: {...} }
    return await prisma.medicalReport.findMany({
      where: filter,
      include: {
        attachments: true,
        attendances: true,
        student: {
          include: {
            user: true
          }
        },
        classSession: {
          include: {
            courseOffering: {
              include: {
                subject: true
              }
            }
          }
        }
      }
    });
  }

  async create(data) {
    // Enforce only one report per student per class session
    if (data.studentId && data.classSessionId) {
      const existing = await prisma.medicalReport.findFirst({
        where: {
          studentId: data.studentId,
          classSessionId: data.classSessionId
        }
      });
      if (existing) {
        const error = new Error('Medical report already submitted for this session');
        error.code = 'ALREADY_EXISTS';
        throw error;
      }
    }
    return await prisma.medicalReport.create({ data });
  }

  async update(id, data) {
    return await prisma.medicalReport.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.medicalReport.delete({ where: { id } });
  }

  async count(filter = {}) {
    return await prisma.medicalReport.count({ where: filter });
  }
}

module.exports = MedicalReportRepository;
