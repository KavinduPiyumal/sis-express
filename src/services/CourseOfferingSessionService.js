const ClassSessionRepository = require('../repositories/ClassSessionRepository');
const ClassSessionDTO = require('../dto/ClassSessionDTO');
const EnrollmentRepository = require('../repositories/EnrollmentRepository');

/**
 * Get all class sessions for a given courseOfferingId, and add attendance summary fields.
 * Also compute attendanceRate per session using active enrollments count.
 * @param {string} courseOfferingId
 * @returns {Promise<Array>} Array of ClassSessionDTO with attendance summary and attendanceRate
 */
const AttendanceRepository = require('../repositories/AttendanceRepository');

async function getSessionsWithAttendanceSummary(courseOfferingId) {
  const classSessionRepo = new ClassSessionRepository();
  const attendanceRepo = new AttendanceRepository();
  const enrollmentRepo = new EnrollmentRepository();

  const sessions = await classSessionRepo.findAll({ courseOfferingId });

  // Count active enrollments once (used to compute attendance rate)
  const activeEnrollmentsCount = await enrollmentRepo.count({ courseOfferingId, status: 'active' });

  return Promise.all(sessions.map(async (session, idx) => {
    const dto = new ClassSessionDTO(session);
    // Get attendance records for this session
    const attendanceRecords = await attendanceRepo.findAll({ classSessionId: session.id });

    let presentCount = 0;
    let absentCount = 0;
    let excusedCount = 0;

    if (attendanceRecords && attendanceRecords.length > 0) {
      dto.attendanceMarked = true;
      presentCount = attendanceRecords.filter(a => a.status === 'present').length;
      absentCount = attendanceRecords.filter(a => a.status === 'absent').length;
      excusedCount = attendanceRecords.filter(a => a.status === 'excused').length;
    } else {
      // No attendance recorded for this session — provide meaningful defaults
      dto.attendanceMarked = false;
      presentCount = 0;
      absentCount = 0;
      excusedCount = 0;
    }

    dto.presentCount = presentCount;
    dto.absentCount = absentCount;
    dto.excusedCount = excusedCount;

    // Compute attendanceRate: percent of present of active enrollments
    if (activeEnrollmentsCount && activeEnrollmentsCount > 0) {
      dto.attendanceRate = Number(((presentCount / activeEnrollmentsCount) * 100).toFixed(2));
    } else {
      // If no enrollments found, fallback to present/(present+absent+excused) if possible
      const denom = presentCount + absentCount + excusedCount;
      dto.attendanceRate = denom > 0 ? Number(((presentCount / denom) * 100).toFixed(2)) : 0;
    }

    return dto;
  }));
}

module.exports = { getSessionsWithAttendanceSummary };
