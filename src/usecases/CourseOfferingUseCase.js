const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
const CourseOfferingDTO = require('../dto/CourseOfferingDTO');

class CourseOfferingUseCase {
  constructor() {
    this.courseOfferingRepository = new CourseOfferingRepository();
  }


  /**
   * Resolve lecturerId - if the provided ID is not found in lecturer table, 
   * treat it as userId and find the corresponding lecturerId
   * @param {string} lecturerIdOrUserId - Could be lecturerId or userId
   * @returns {string|null} - The actual lecturerId or null if not found
   */
  async resolveLecturerId(lecturerIdOrUserId) {
    const LecturerRepository = require('../repositories/LecturerRepository');
    const lecturerRepo = new LecturerRepository();
    
    // First, check if it's a valid lecturerId
    const lecturerById = await lecturerRepo.findById(lecturerIdOrUserId);
    if (lecturerById) {
      return lecturerIdOrUserId; // It's already a valid lecturerId
    }
    
    // If not found, treat it as userId and find the corresponding lecturer
    const lecturerByUserId = await lecturerRepo.findOne({ userId: lecturerIdOrUserId });
    if (lecturerByUserId) {
      return lecturerByUserId.id; // Return the actual lecturerId
    }
    
    // If neither works, return null (will cause no results to be found)
    return null;
  }

  /**
   * Get course offerings by dynamic filters (e.g., lecturerId, subjectId, batchId, semesterId)
   * @param {Object} filters - key-value pairs for filtering
   */
  async getCourseOfferingsByFilters(filters = {}, options = {}) {
    // Pagination defaults
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const perPageRaw = parseInt(options.limit, 10) || 20;
    const perPage = Math.min(Math.max(1, perPageRaw), 100);

    // Optional search across subject name/code
    const q = (options.q || options.search || '').toString().trim();
    if (q) {
      // expand filters to include OR search on related subject fields
      filters = {
        AND: [
          filters,
          {
            OR: [
              { subject: { name: { contains: q, mode: 'insensitive' } } },
              { subject: { code: { contains: q, mode: 'insensitive' } } }
            ]
          }
        ]
      };
    }

    const total = await this.courseOfferingRepository.count(filters);
    const totalPages = total === 0 ? 1 : Math.ceil(total / perPage);
    const safePage = page > totalPages ? totalPages : page;

    const skip = (safePage - 1) * perPage;

    const orderBy = options.orderBy || { year: 'desc' };

    const offerings = await this.courseOfferingRepository.findByFilters(filters, { skip, take: perPage, include: options.include, orderBy });

    // Attach sessions to each offering
    const data = await Promise.all(
      offerings.map(offering => CourseOfferingDTO.buildWithSessions(offering))
    );

    return {
      data,
      meta: {
        total,
        totalPages,
        page: safePage,
        perPage
      }
    };
  }
  
  async getCourseOfferingsByLecturer(userId) {
    // Find lecturer by userId
    const LecturerRepository = require('../repositories/LecturerRepository');
    const lecturerRepo = new LecturerRepository();
    const lecturer = await lecturerRepo.findOne({ userId });
    if (!lecturer) throw new Error('Lecturer record not found for this user');

    // Custom options to include enrollment records for lecturer's course offerings
    const options = {
      include: {
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
        },
        enrollments: {
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
            }
          }
        }
      }
    };

    const offerings = await this.courseOfferingRepository.findByFilters({ lecturerId: lecturer.id }, options);
    
  return Promise.all(offerings.map(offering => CourseOfferingDTO.buildWithSessions(offering)));
  }

  // Lightweight listing for lecturer: only counts (active enrollments and sessions)
  async getCourseOfferingsByLecturerLight(userId) {
    const LecturerRepository = require('../repositories/LecturerRepository');
    const lecturerRepo = new LecturerRepository();
    const lecturer = await lecturerRepo.findOne({ userId });
    if (!lecturer) throw new Error('Lecturer record not found for this user');

    const offerings = await this.courseOfferingRepository.findByFilters({ lecturerId: lecturer.id });
    return Promise.all(offerings.map(offering => CourseOfferingDTO.buildWithCounts(offering)));
  }

  // Detailed endpoint: for a given courseOfferingId, return active enrollments (with student.user) and sessions
  async getCourseOfferingDetails(courseOfferingId) {
    const EnrollmentRepository = require('../repositories/EnrollmentRepository');
  const ClassSessionRepository = require('../repositories/ClassSessionRepository');
  const { getSessionsWithAttendanceSummary } = require('../services/CourseOfferingSessionService');
  const enrollmentRepo = new EnrollmentRepository();
  const classSessionRepo = new ClassSessionRepository();

    // Active enrollments with student.user
    const enrollments = await enrollmentRepo.findAll({ courseOfferingId }, {
      include: {
        student: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        }
      }
    });

    // Use service to fetch sessions already enriched with attendance summary
    const sessions = await getSessionsWithAttendanceSummary(courseOfferingId);

    return { enrollments, sessions };
  }

  async createCourseOffering(data) {
    const offering = await this.courseOfferingRepository.create(data);
    return new CourseOfferingDTO(offering);
  }

  async getAllCourseOfferings() {
    const offerings = await this.courseOfferingRepository.findAll();
    return offerings.map(offering => new CourseOfferingDTO(offering));
  }

  async getCourseOfferingById(id) {
    const offering = await this.courseOfferingRepository.findById(id);
    if (!offering) throw new Error('Course offering not found');
    return new CourseOfferingDTO(offering);
  }

  async updateCourseOffering(id, data) {
    const offering = await this.courseOfferingRepository.update(id, data);
    if (!offering) throw new Error('Course offering not found');
    return new CourseOfferingDTO(offering);
  }

  async deleteCourseOffering(id) {
    const deleted = await this.courseOfferingRepository.delete(id);
    if (!deleted) throw new Error('Course offering not found');
    return { message: 'Course offering deleted successfully' };
  }
}

module.exports = CourseOfferingUseCase;
