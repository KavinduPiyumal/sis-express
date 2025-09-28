const { MedicalReportRepository, AttendanceRepository, UserRepository } = require('../repositories');
const { MedicalReportDTO } = require('../dto/MedicalReportDTO');
const { AttendanceDTO } = require('../dto/AttendanceDTO');

class MedicalReportUseCase {
  constructor() {
    this.medicalReportRepository = new MedicalReportRepository();
    this.attendanceRepository = new AttendanceRepository();
    this.userRepository = new UserRepository();
  }

  async submitMedicalReport(data, studentId) {
    // Only students can submit for themselves
    if (data.studentId !== studentId) throw new Error('Unauthorized');
    const report = await this.medicalReportRepository.create({ ...data, status: 'pending' });
    return new MedicalReportDTO(report);
  }

  async reviewMedicalReport(reportId, reviewerId, reviewerRole, status, reviewNotes) {
    if (!['admin', 'super_admin', 'lecturer'].includes(reviewerRole)) throw new Error('Unauthorized');
    const report = await this.medicalReportRepository.findById(reportId);
    if (!report) throw new Error('Medical report not found');
    if (report.status !== 'pending') throw new Error('Already reviewed');

    // Update report
    await this.medicalReportRepository.update({
      status,
      reviewedBy: reviewerId,
      reviewNotes,
      reviewedAt: new Date()
    }, { id: reportId });

    // If approved, update attendance for the date range
    if (status === 'approved') {
      const { studentId, startDate, endDate } = report;
      const dates = [startDate];
      if (endDate && endDate !== startDate) {
        // Generate all dates between startDate and endDate
        let d = new Date(startDate);
        const end = new Date(endDate);
        while (d < end) {
          d.setDate(d.getDate() + 1);
          dates.push(d.toISOString().slice(0, 10));
        }
      }
      for (const date of dates) {
        // Find attendance for this student/date
        const attendance = await this.attendanceRepository.findOne({ studentId, date });
        if (attendance) {
          // Update status to 'excused'
          await this.attendanceRepository.update({ status: 'excused' }, { id: attendance.id });
        } else {
          // Optionally, create an excused attendance record
          await this.attendanceRepository.create({ studentId, date, status: 'excused', recordedBy: reviewerId });
        }
      }
    }
    const updated = await this.medicalReportRepository.findById(reportId);
    return new MedicalReportDTO(updated);
  }

  async getMedicalReportsByStudent(studentId) {
    const reports = await this.medicalReportRepository.findAll({ where: { studentId } });
    return reports.map(r => new MedicalReportDTO(r));
  }

  async getAllMedicalReports() {
    const reports = await this.medicalReportRepository.findAll();
    return reports.map(r => new MedicalReportDTO(r));
  }
}

module.exports = MedicalReportUseCase;
