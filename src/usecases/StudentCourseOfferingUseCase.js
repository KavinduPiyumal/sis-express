const StudentRepository = require('../repositories/StudentRepository');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');
const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
const CourseOfferingDTO = require('../dto/CourseOfferingDTO');

class StudentCourseOfferingUseCase {
  constructor() {
    this.studentRepository = new StudentRepository();
    this.enrollmentRepository = new EnrollmentRepository();
    this.courseOfferingRepository = new CourseOfferingRepository();
  }

  // Get all course offerings the student is enrolled in
  async getMyCourses(userId) {
    // Find student by userId
    const student = await this.studentRepository.findOne({ userId });
    if (!student) throw new Error('Student record not found for this user');
  // Find all active enrollments for this student
  const enrollments = await this.enrollmentRepository.findAll({ studentId: student.id, status: 'active' });
  const courseOfferingIds = enrollments.map(e => e.courseOfferingId);
  if (courseOfferingIds.length === 0) return [];
    // Fetch all course offerings with full include
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
  const offerings = await this.courseOfferingRepository.findByFilters({ id: { in: courseOfferingIds } }, options);
  return Promise.all(offerings.map(offering => CourseOfferingDTO.buildWithStudentSessions(offering, student.id)));
  }

  // Get all course offerings for the student's batch, excluding already enrolled
  async getBatchAvailableCourses(userId) {
    // Find student by userId
    const student = await this.studentRepository.findOne({ userId });
    if (!student) throw new Error('Student record not found for this user');
  // Find all active enrollments for this student
  const enrollments = await this.enrollmentRepository.findAll({ studentId: student.id, status: 'active' });
  const enrolledOfferingIds = enrollments.map(e => e.courseOfferingId);
    // Find all course offerings for the student's batch
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
    const filter = { batchId: student.batchId };
    if (enrolledOfferingIds.length > 0) {
      filter.id = { notIn: enrolledOfferingIds };
    }
    const offerings = await this.courseOfferingRepository.findByFilters(filter, options);
    return Promise.all(offerings.map(offering => CourseOfferingDTO.buildWithSessions(offering)));
  }
}

module.exports = StudentCourseOfferingUseCase;
