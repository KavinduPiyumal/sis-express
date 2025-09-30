const { EnrollmentRepository } = require('../repositories');
const { EnrollmentDTO } = require('../dto/EnrollmentDTO');
const logger = require('../config/logger');


class EnrollmentUseCase {
  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }

  // Student requests enrollment (pending approval)
  async requestEnrollment(data, userId) {
    logger.info(`Enrollment request by user ID: ${userId} for course offering ID: ${data.courseOfferingId}`);

    // Find student by userId
    const StudentRepository = require('../repositories/StudentRepository');
    const studentRepo = new StudentRepository();
    const student = await studentRepo.findOne({ userId });
    if (!student) throw new Error('Student record not found for this user');

    // Check for duplicate request
    const exists = await this.enrollmentRepository.findByStudentAndOffering(student.id, data.courseOfferingId);
    if (exists) throw new Error('Already requested or enrolled');
    const enrollment = await this.enrollmentRepository.create({
      studentId: student.id,
      courseOfferingId: data.courseOfferingId,
      status: 'pending',
      enrolledDate: new Date(),
    });
    return new EnrollmentDTO(enrollment);
  }

  // Admin approves enrollment request
  async approveEnrollment(id, approverId) {
    // Find enrollment
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status !== 'pending') throw new Error('Only pending enrollments can be approved');
    await this.enrollmentRepository.update(id, { status: 'active' });
    return this.getEnrollmentById(id);
  }

  // Admin/super_admin enrolls student directly
  async createEnrollment(data) {
    // Check for duplicate
    const exists = await this.enrollmentRepository.findByStudentAndOffering(data.studentId, data.courseOfferingId);
    if (exists) throw new Error('Student already enrolled or requested');
    const enrollment = await this.enrollmentRepository.create({
      studentId: data.studentId,
      courseOfferingId: data.courseOfferingId,
      status: 'active',
      enrolledDate: data.enrolledDate || new Date(),
    });
    return new EnrollmentDTO(enrollment);
  }

  async getAllEnrollments() {
    const prisma = require('../infrastructure/prisma');
    // Find all enrollments with associated student and course offering
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: true,
        courseOffering: {
          include: {
            subject: true,
            semester: true,
            batch: true,
            lecturer: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
    // Map to DTOs, including student and courseOffering
    return enrollments.map(e => {
      const dto = new EnrollmentDTO(e);
      dto.student = e.student;
      dto.courseOffering = e.courseOffering;
      return dto;
    });
  }

  async getEnrollmentById(id) {
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new Error('Enrollment not found');
    return new EnrollmentDTO(enrollment);
  }

  async updateEnrollment(id, data) {
    await this.enrollmentRepository.update(id, data);
    return this.getEnrollmentById(id);
  }

  async deleteEnrollment(id) {
    return this.enrollmentRepository.delete(id);
  }
}

module.exports = EnrollmentUseCase;
