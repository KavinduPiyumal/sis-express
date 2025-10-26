const { EnrollmentRepository } = require('../repositories');
const { EnrollmentDTO } = require('../dto/EnrollmentDTO');
const logger = require('../config/logger');
const prisma = require('../infrastructure/prisma');

class EnrollmentUseCase {
  constructor() {
    this.enrollmentRepository = new EnrollmentRepository();
  }




  // Student requests enrollment (pending approval)
  async requestEnrollment(data, userId) {
    logger.info(`Enrollment request by user ID: ${userId} for course offering ID: ${data.courseOfferingId}`);

    // Find student by userId
    const StudentRepository = require('../repositories/StudentRepository');
    const UserRepository = require('../repositories/UserRepository');
    const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
    const emailService = require('../infrastructure/emailService');
    const studentRepo = new StudentRepository();
    const userRepo = new UserRepository();
    const courseOfferingRepo = new CourseOfferingRepository();

    const student = await studentRepo.findOne({ userId });
    if (!student) throw new Error('Student record not found for this user');

    // Check for duplicate request
    const exists = await this.enrollmentRepository.findByStudentAndOffering(student.id, data.courseOfferingId);
    if (exists) throw new Error('Already requested or enrolled');

    // Create enrollment
    const enrollment = await this.enrollmentRepository.create({
      studentId: student.id,
      courseOfferingId: data.courseOfferingId,
      status: 'pending',
      enrolledDate: new Date(),
    });

    // Fetch user and course offering details for email
    const studentUser = await userRepo.findById(student.userId);
    const courseOffering = await prisma.courseOffering.findUnique({
      where: { id: data.courseOfferingId },
      include: {
        subject: true,
        semester: true,
        batch: true,
        lecturer: { include: { user: true } }
      }
    });


    const notificationService = require('../infrastructure/notificationService');
    // Send notification (and optionally email) to student
    if (studentUser && courseOffering && courseOffering.subject && courseOffering.semester && courseOffering.batch) {
      const subject = 'Enrollment Request Received';
      const message = `Your enrollment request for <b>${courseOffering.subject.name}</b> (Batch: ${courseOffering.batch.name}, Semester: ${courseOffering.semester.name}) has been received and is pending lecturer approval.`;
      await notificationService.notifyUser({
        user: studentUser,
        title: subject,
        message,
        type: 'enrollment',
        relatedEntityId: enrollment.id,
        relatedEntityType: 'Enrollment',
        isNotifyEmail: true
      });
    } else {
      logger.warn('Missing studentUser or courseOffering details for enrollment confirmation email', {
        studentUser: !!studentUser,
        subject: courseOffering && courseOffering.subject ? courseOffering.subject.name : null,
        semester: courseOffering && courseOffering.semester ? courseOffering.semester.name : null,
        batch: courseOffering && courseOffering.batch ? courseOffering.batch.name : null
      });
    }

    // Send notification (and optionally email) to lecturer
    if (courseOffering && courseOffering.lecturer && courseOffering.lecturer.user) {
      const lecturerUser = courseOffering.lecturer.user;
      const subject = 'New Enrollment Request to Review';
      const message = `A student (<b>${studentUser.firstName} ${studentUser.lastName}</b>, Reg No: ${student.studentNo}) has requested enrollment for <b>${courseOffering.subject.name}</b> (Batch: ${courseOffering.batch.name}, Semester: ${courseOffering.semester.name}). Please review and approve or reject the request in SIS.`;
      await notificationService.notifyUser({
        user: lecturerUser,
        title: subject,
        message,
        type: 'enrollment',
        relatedEntityId: enrollment.id,
        relatedEntityType: 'Enrollment',
        isNotifyEmail: true
      });
    } else {
      logger.warn('Missing lecturer or lecturer user details for enrollment review email', {
        lecturer: courseOffering && courseOffering.lecturer ? true : false,
        lecturerUser: courseOffering && courseOffering.lecturer && courseOffering.lecturer.user ? true : false
      });
    }

    return new EnrollmentDTO(enrollment);
  }

  // Bulk approve enrollments by id array
  async bulkApproveEnrollments(ids, approverId) {
    if (!Array.isArray(ids) || ids.length === 0) return { updated: 0 };
    let updated = 0;
    const UserRepository = require('../repositories/UserRepository');
    const userRepo = new UserRepository();
    const emailService = require('../infrastructure/emailService');
    const prisma = require('../infrastructure/prisma');
    const notificationService = require('../infrastructure/notificationService');
    for (const id of ids) {
      const enrollment = await this.enrollmentRepository.findById(id);
      if (enrollment && enrollment.status === 'pending') {
        await this.enrollmentRepository.update(id, { status: 'active' });
        updated++;
        // Send notification (and optionally email) to student
        try {
          const studentUser = await userRepo.findById(enrollment.studentId);
          // If not found by userId, try to get student and then user
          let user = studentUser;
          if (!user) {
            const StudentRepository = require('../repositories/StudentRepository');
            const studentRepo = new StudentRepository();
            const student = await studentRepo.findById(enrollment.studentId);
            if (student) user = await userRepo.findById(student.userId);
          }
          const courseOffering = await prisma.courseOffering.findUnique({
            where: { id: enrollment.courseOfferingId },
            include: { subject: true, semester: true, batch: true }
          });
          if (user && courseOffering && courseOffering.subject && courseOffering.semester && courseOffering.batch) {
            const subject = 'Enrollment Approved';
            const message = `Your enrollment for <b>${courseOffering.subject.name}</b> (Batch: ${courseOffering.batch.name}, Semester: ${courseOffering.semester.name}) has been approved.`;
            await notificationService.notifyUser({
              user,
              title: subject,
              message,
              type: 'enrollment',
              relatedEntityId: enrollment.id,
              relatedEntityType: 'Enrollment',
              isNotifyEmail: true
            });
          }
        } catch (err) {
          logger.warn('Failed to send enrollment approval email or notification in bulkApproveEnrollments', { error: err.message });
        }
      }
    }
    return { updated };
  }
  
  // Admin approves enrollment request
  async approveEnrollment(id, approverId) {
    // Find enrollment
    const enrollment = await this.enrollmentRepository.findById(id);
    if (!enrollment) throw new Error('Enrollment not found');
    if (enrollment.status !== 'pending') throw new Error('Only pending enrollments can be approved');
    await this.enrollmentRepository.update(id, { status: 'active' });
    // Send notification (and optionally email) to student
    try {
      const UserRepository = require('../repositories/UserRepository');
      const userRepo = new UserRepository();
      const prisma = require('../infrastructure/prisma');
      const notificationService = require('../infrastructure/notificationService');
      const studentUser = await userRepo.findById(enrollment.studentId);
      let user = studentUser;
      if (!user) {
        const StudentRepository = require('../repositories/StudentRepository');
        const studentRepo = new StudentRepository();
        const student = await studentRepo.findById(enrollment.studentId);
        if (student) user = await userRepo.findById(student.userId);
      }
      const courseOffering = await prisma.courseOffering.findUnique({
        where: { id: enrollment.courseOfferingId },
        include: { subject: true, semester: true, batch: true }
      });
      if (user && courseOffering && courseOffering.subject && courseOffering.semester && courseOffering.batch) {
        const subject = 'Enrollment Approved';
        const message = `Your enrollment for <b>${courseOffering.subject.name}</b> (Batch: ${courseOffering.batch.name}, Semester: ${courseOffering.semester.name}) has been approved.`;
        await notificationService.notifyUser({
          user,
          title: subject,
          message,
          type: 'enrollment',
          relatedEntityId: enrollment.id,
          relatedEntityType: 'Enrollment',
          isNotifyEmail: true
        });
      }
    } catch (err) {
      logger.warn('Failed to send enrollment approval email or notification in approveEnrollment', { error: err.message });
    }
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
