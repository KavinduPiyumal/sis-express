const { MedicalReportRepository, AttendanceRepository, UserRepository } = require('../repositories');
const { MedicalReportDTO } = require('../dto/MedicalReportDTO');
const { AttendanceDTO } = require('../dto/AttendanceDTO');

class MedicalReportUseCase {
  constructor() {
    this.medicalReportRepository = new MedicalReportRepository();
    this.attendanceRepository = new AttendanceRepository();
    this.userRepository = new UserRepository();
  }

  // Admin: Get all medical reports for course offerings assigned to admin (with all relations)
  async getMedicalReportsForAdminCourseOfferings(adminId) {
    // Find course offerings assigned to this admin (lecturer)
    const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
    const ClassSessionRepository = require('../repositories/ClassSessionRepository');
    const courseOfferingRepo = new CourseOfferingRepository();
    const classSessionRepo = new ClassSessionRepository();
    // Get all course offerings for this admin
    const offerings = await courseOfferingRepo.findAll({ lecturerId: adminId });
    const offeringIds = offerings.map(o => o.id);
    // Get all class sessions for these offerings
    const sessions = await classSessionRepo.findAll({ courseOfferingId: { in: offeringIds } });
    const sessionIds = sessions.map(s => s.id);
    // Get all medical reports for these sessions, with all relations
    const reports = await this.medicalReportRepository.findAll({ classSessionId: { in: sessionIds } });
    return reports.map(r => new MedicalReportDTO(r));
  }

  async submitMedicalReport(data, studentId) {
    // Only students can submit for themselves
    if (data.studentId !== studentId) throw new Error('Unauthorized');
    const prisma = require('../infrastructure/prisma');
    const { attachments, ...reportData } = data;
    let reportId = null;
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Enforce only one report per student per class session
        if (reportData.studentId && reportData.classSessionId) {
          const existing = await tx.medicalReport.findFirst({
            where: {
              studentId: reportData.studentId,
              classSessionId: reportData.classSessionId
            }
          });
          if (existing) {
            const error = new Error('Medical report already submitted for this session');
            error.code = 'ALREADY_EXISTS';
            throw error;
          }
        }
        // Create the medical report
        const report = await tx.medicalReport.create({ data: { ...reportData, status: 'pending' } });
        reportId = report.id;

        // Link attendance records for this student and classSessionId
        if (report.classSessionId && studentId) {
          const attendances = await tx.attendance.findMany({
            where: {
              classSessionId: report.classSessionId,
              studentId: studentId
            }
          });
          for (const attendance of attendances) {
            await tx.attendance.update({
              where: { id: attendance.id },
              data: { medicalReportId: report.id }
            });
          }
        }

        // If attachments are provided, create them
        if (Array.isArray(attachments) && attachments.length > 0) {
          for (const att of attachments) {
            await tx.medicalReportAttachment.create({
              data: { ...att, medicalReportId: report.id }
            });
          }
        }
        return report;
      });
      // Return report with attachments and updated attendances
      const fullReport = await this.medicalReportRepository.findById(result.id);
      return new MedicalReportDTO(fullReport);
    } catch (err) {
      // If report was created but error happened after, ensure cleanup
      if (reportId) {
        try { await prisma.medicalReport.delete({ where: { id: reportId } }); } catch (e) {}
      }
      throw err;
    }
  }

  async reviewMedicalReport(reportId, reviewerId, reviewerRole, status, reviewNotes) {
    if (!['admin', 'super_admin', 'lecturer'].includes(reviewerRole)) throw new Error('Unauthorized');
    const report = await this.medicalReportRepository.findById(reportId);
    if (!report) throw new Error('Medical report not found');
    if (report.status !== 'pending') throw new Error('Already reviewed');

    // Update report
    await this.medicalReportRepository.update(reportId, {
      status,
      reviewedBy: reviewerId,
      reviewNotes,
      reviewedAt: new Date()
    });

    // If approved, update attendance records linked to this report
    if (status === 'approved' && Array.isArray(report.attendances)) {
      for (const attendance of report.attendances) {
        await this.attendanceRepository.update(attendance.id, { status: 'excused' });
      }
    }
    const updated = await this.medicalReportRepository.findById(reportId);
    return new MedicalReportDTO(updated);
  }

  async getMedicalReportsByStudent(studentId, classSessionId) {
    const filter = { studentId };
    if (classSessionId) filter.classSessionId = classSessionId;
    const reports = await this.medicalReportRepository.findAll(filter);
    return reports.map(r => new MedicalReportDTO(r));
  }

  async getAllMedicalReports() {
    const reports = await this.medicalReportRepository.findAll();
    return reports.map(r => new MedicalReportDTO(r));
  }
}

module.exports = MedicalReportUseCase;
