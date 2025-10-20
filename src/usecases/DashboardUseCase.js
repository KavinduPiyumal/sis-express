const logger = require('../config/logger');

const LecturerRepository = new (require('../repositories/LecturerRepository'))();
const UserRepository = new (require('../repositories/UserRepository'))();
const StudentRepository = new (require('../repositories/StudentRepository'))();
const AttendanceRepository = new (require('../repositories/AttendanceRepository'))();
const MedicalReportRepository = new (require('../repositories/MedicalReportRepository'))();
const CGPARepository = new (require('../repositories/CGPARepository'))();
const SemesterGPARepository = new (require('../repositories/SemesterGPARepository'))();
const ResultRepository = new (require('../repositories/ResultRepository'))();
const NoticeRepository = new (require('../repositories/NoticeRepository'))();
const LinkRepository = new (require('../repositories/LinkRepository'))();
const ClassSessionRepository = new (require('../repositories/ClassSessionRepository'))();
const CourseOfferingRepository = new (require('../repositories/CourseOfferingRepository'))();
const BatchRepository = new (require('../repositories/BatchRepository'))();
const DegreeProgramRepository = new (require('../repositories/DegreeProgramRepository'))();

const AttendanceUseCase = new (require('./AttendanceUseCase'))();
class DashboardUseCase {
  async getStudentDashboard(user) {
    if (!user.student || !user.student.id) throw new Error('No student record for user');
    const studentId = user.student.id;
    // Profile
    const student = await StudentRepository.findById(studentId);
    const batch = await BatchRepository.findById(student.batchId);
    const degreeProgram = await DegreeProgramRepository.findById(batch.programId);
    // Academic
    const cgpa = await CGPARepository.findLatestByStudent(studentId);
    const semesterGPA = await SemesterGPARepository.findLatestByStudent(studentId);
    // Attendance
    const attendanceStats = await AttendanceRepository.getAttendanceStats(studentId);
    // Medical Reports
    const medicalReports = await MedicalReportRepository.findAll({ studentId });
    // Results
    const results = await ResultRepository.findLatestByStudent(studentId, 5);
    // Notices
    const notices = await NoticeRepository.findRecentForStudent(studentId, 5);
    // Links
    const links = await LinkRepository.findHighlightsForStudent(studentId, 5);
    // Upcoming Sessions
    const sessions = await ClassSessionRepository.findUpcomingForStudent(studentId, 3);
    return {
      profile: { name: user.firstName + ' ' + user.lastName, studentNo: student.studentNo, batch: batch.name, degreeProgram: degreeProgram.name, status: student.status },
      academic: { cgpa, semesterGPA, graduationStatus: cgpa?.graduationStatus, creditsEarned: student.creditsEarned, minCreditsToGraduate: degreeProgram.minCreditsToGraduate },
      attendance: attendanceStats,
      medicalReports: {
        total: medicalReports.length,
        approved: medicalReports.filter(r => r.status === 'approved').length,
        pending: medicalReports.filter(r => r.status === 'pending').length,
        rejected: medicalReports.filter(r => r.status === 'rejected').length
      },
      results,
      notices,
      links,
      upcomingSessions: sessions
    };
  }

  async getLecturerDashboard(user) {
    if (!user.lecturer || !user.lecturer.id) throw new Error('No lecturer record for user');
    logger.info(`Generating dashboard for lecturer userId: ${user.id}`);
    const lecturer = await LecturerRepository.findByUserId(user.id);
    if (!lecturer) throw new Error('Lecturer not found for user');
    const lecturerId = user.lecturer.id;
    // Courses
    const courseOfferings = await CourseOfferingRepository.findByLecturer(lecturerId);
    const subjects = courseOfferings.map(c => c.subjectId);
    // Medical Reports
    const medicalReports = await MedicalReportRepository.getMedicalReportsForAdminCourseOfferings(lecturerId);
    // Attendance
    const attendanceStats = await AttendanceRepository.getSubjectWiseStatsForLecturer(lecturerId);
    // Results
    const results = await ResultRepository.findByLecturerId(lecturerId);
    // GPA Distribution (subject-wise and overall for current semester(s) in progress)
    let gpaDistribution = {};
    let overallGPA = [];
    if (results.length > 0) {
      // Only include results where the semester status is 'inprogress'
      const currentSemesterResults = results.filter(r => r.courseOffering?.semester?.status === 'inprogress');
      // Subject-wise GPA distribution
      const subjectMap = {};
      for (const r of currentSemesterResults) {
        const subjectName = r.courseOffering?.subject?.name || 'Unknown';
        if (!subjectMap[subjectName]) subjectMap[subjectName] = [];
        if (r.gradePoint !== null && r.gradePoint !== undefined) subjectMap[subjectName].push(Number(r.gradePoint));
        if (r.gradePoint !== null && r.gradePoint !== undefined) overallGPA.push(Number(r.gradePoint));
      }
      gpaDistribution = Object.fromEntries(
        Object.entries(subjectMap).map(([subject, gpas]) => [subject, {
          count: gpas.length,
          average: gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length) : 0,
          min: gpas.length ? Math.min(...gpas) : null,
          max: gpas.length ? Math.max(...gpas) : null,
          distribution: gpas
        }])
      );
    }
    // Notices
    const notices = await NoticeRepository.findRecentForLecturer(lecturerId, 5);
    // Students
    const students = await StudentRepository.findByLecturer(lecturerId);
    // Links
    const links = await LinkRepository.findHighlightsForLecturer(lecturerId, 5);
    // Upcoming Sessions
    const sessions = await ClassSessionRepository.findUpcomingForLecturer(lecturerId, 3);
    return {
      profile: { name: user.firstName + ' ' + user.lastName, lecturerId: lecturer.lecturerId, department: lecturer.departmentId, status: lecturer.status },
      courses: { count: courseOfferings.length },
      medicalReports: {
        total: medicalReports.length,
        approved: medicalReports.filter(r => r.status === 'approved').length,
        pending: medicalReports.filter(r => r.status === 'pending').length,
        rejected: medicalReports.filter(r => r.status === 'rejected').length
      },
      attendance: attendanceStats,
      results: {
        entered: results.length,
        pending: results.filter(r => r.status === 'pending').length,
        completed: results.filter(r => r.status === 'completed').length,
        gpaDistribution,
        overallGPA: {
          count: overallGPA.length,
          average: overallGPA.length ? (overallGPA.reduce((a, b) => a + b, 0) / overallGPA.length) : 0,
          min: overallGPA.length ? Math.min(...overallGPA) : null,
          max: overallGPA.length ? Math.max(...overallGPA) : null,
          distribution: overallGPA
        }
      },
      students: { total: students.length, active: students.filter(s => s.status === 'active').length, inactive: students.filter(s => s.status !== 'active').length },
      notices,
      links,
      upcomingSessions: sessions
    };
  }
}

module.exports = DashboardUseCase;