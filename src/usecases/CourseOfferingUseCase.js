const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
const CourseOfferingDTO = require('../dto/CourseOfferingDTO');

class CourseOfferingUseCase {
  constructor() {
    this.courseOfferingRepository = new CourseOfferingRepository();
  }


  /**
   * Get course offerings by dynamic filters (e.g., lecturerId, subjectId, batchId, semesterId)
   * @param {Object} filters - key-value pairs for filtering
   */
  async getCourseOfferingsByFilters(filters = {}, options = {}) {
    const offerings = await this.courseOfferingRepository.findByFilters(filters, options);
    return offerings.map(offering => new CourseOfferingDTO(offering));
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
    return offerings.map(offering => new CourseOfferingDTO(offering));
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
