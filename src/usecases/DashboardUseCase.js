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
    // Find current semester for this batch
    const semesters = await (require('../repositories/SemesterRepository')).prototype.findAll({ batchId: batch.id, status: 'inprogress' });
    const currentSemester = semesters && semesters.length > 0 ? semesters[0] : null;
        let currentSemesterResults = [];
    if (currentSemester) {
      currentSemesterResults = await ResultRepository.findByFilters({ studentId, courseOffering: { semesterId: semesters[0].id } });
    }
  // Academic (calculate from results if CGPA/SemesterGPA not available)
  // Get all results for this student
  const allResults = await ResultRepository.findByFilters({ studentId });
  // Calculate overall GPA (all results with gradePoint)
  const allGradePoints = allResults.filter(r => r.gradePoint !== null && r.gradePoint !== undefined).map(r => Number(r.gradePoint));
  const overallGPA = allGradePoints.length ? (allGradePoints.reduce((a, b) => a + b, 0) / allGradePoints.length) : 0;
  // Calculate current semester GPA (currentSemesterResults)
  const semesterGradePoints = currentSemesterResults.filter(r => r.gradePoint !== null && r.gradePoint !== undefined).map(r => Number(r.gradePoint));
  const currentSemesterGPA = semesterGradePoints.length ? (semesterGradePoints.reduce((a, b) => a + b, 0) / semesterGradePoints.length) : 0;
  // For compatibility, set cgpa and semesterGPA fields
  const cgpa = { cgpaValue: overallGPA };
  const semesterGPA = { gpaValue: currentSemesterGPA };
    // Results (all for current semester)

    // Subjects completed (passed in current semester)
    const subjectsCompleted = currentSemesterResults.filter(r => r.grade && r.grade.toUpperCase() !== 'F').length;
    // Credits completed (current/total)
    const creditsCompleted = currentSemesterResults.reduce((sum, r) => sum + (r.courseOffering?.subject?.credits || 0), 0);
    const minCreditsToGraduate = degreeProgram.minCreditsToGraduate || 120;
    const creditsProgress = minCreditsToGraduate > 0 ? Math.round((creditsCompleted / minCreditsToGraduate) * 100) : 0;
    // Attendance overview (subject-wise for current semester)
    let attendanceOverview = [];
    if (currentSemester) {
      // Get all course offerings for this student in current semester
      const enrollments = await (require('../repositories/EnrollmentRepository')).prototype.findAll({ studentId, courseOffering: { semesterId: currentSemester.id } }, { include: { courseOffering: { include: { subject: true } } } });
      for (const enrollment of enrollments) {
        const courseOffering = enrollment.courseOffering;
        if (!courseOffering) continue;
        const attStats = await AttendanceRepository.getAttendanceStats(studentId, courseOffering.id);
        attendanceOverview.push({
          subject: courseOffering.subject,
          courseOfferingId: courseOffering.id,
          attendancePercentage: attStats.attendancePercentage
        });
      }
    }
    // Attendance rate (overall for current semester)
    let attendanceRate = null;
    if (attendanceOverview.length > 0) {
      const total = attendanceOverview.reduce((sum, s) => sum + s.attendancePercentage, 0);
      attendanceRate = Math.round((total / attendanceOverview.length) * 100) / 100;
    }
    // Academic performance (GPA trend over semesters)
    let gpaTrend = [];
    const allSemesterGPAs = await SemesterGPARepository.findAll({ studentId });
    // Get all semesters for this batch (for name/status lookup)
    const allSemesters = await (require('../repositories/SemesterRepository')).prototype.findAll({ batchId: batch.id });
    const semesterMap = {};
    for (const s of allSemesters) {
      semesterMap[s.id] = { name: s.name, status: s.status };
    }
    if (allSemesterGPAs && allSemesterGPAs.length > 0) {
      gpaTrend = allSemesterGPAs.map(g => ({
        semesterId: g.semesterId,
        semesterName: semesterMap[g.semesterId]?.name || null,
        semesterStatus: semesterMap[g.semesterId]?.status || null,
        gpa: Number(g.gpaValue)
      }));
    } else {
      // Fallback: calculate GPA trend from results grouped by semester
      const resultsBySemester = {};
      for (const r of allResults) {
        const semesterId = r.courseOffering?.semesterId;
        if (!semesterId) continue;
        if (!resultsBySemester[semesterId]) resultsBySemester[semesterId] = [];
        if (r.gradePoint !== null && r.gradePoint !== undefined) {
          resultsBySemester[semesterId].push(Number(r.gradePoint));
        }
      }
      gpaTrend = Object.entries(resultsBySemester).map(([semesterId, gradePoints]) => ({
        semesterId,
        semesterName: semesterMap[semesterId]?.name || null,
        semesterStatus: semesterMap[semesterId]?.status || null,
        gpa: gradePoints.length ? (gradePoints.reduce((a, b) => a + b, 0) / gradePoints.length) : 0
      })).sort((a, b) => a.semesterId.localeCompare(b.semesterId));
    }
    // Recent results (latest for current semester)
    const recentResults = currentSemesterResults.slice(0, 5).map(r => ({
      subjectCode: r.courseOffering?.subject?.code,
      subjectName: r.courseOffering?.subject?.name,
      marks: r.marks,
      grade: r.grade,
      credits: r.courseOffering?.subject?.credits,
      date: r.courseOffering?.semester?.startDate
    }));
    // Notices
    const notices = await NoticeRepository.findRecentForStudent(studentId, 5);
    // Links
    const links = await LinkRepository.findHighlightsForStudent(studentId, 5);
    // Upcoming Sessions
    const sessions = await ClassSessionRepository.findUpcomingForStudent(studentId, 5);
    return {
      profile: { name: user.firstName + ' ' + user.lastName, studentNo: student.studentNo, batch: batch.name, degreeProgram: degreeProgram.name, status: student.status },
      academic: {
        cgpa,
        semesterGPA,
        graduationStatus: cgpa?.graduationStatus,
        creditsCompleted,
        minCreditsToGraduate,
        creditsProgress,
        subjectsCompleted
      },
      attendance: {
        rate: attendanceRate,
        overview: attendanceOverview
      },
      academicPerformance: {
        gpaTrend
      },
      recentResults,
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