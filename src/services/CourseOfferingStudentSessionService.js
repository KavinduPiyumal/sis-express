const AttendanceRepository = require('../repositories/AttendanceRepository');
const ClassSessionRepository = require('../repositories/ClassSessionRepository');
const ClassSessionDTO = require('../dto/ClassSessionDTO');

/**
 * Get all class sessions for a given courseOfferingId, and add attendance status for a specific student.
 * @param {string} courseOfferingId
 * @param {string} studentId
 * @returns {Promise<Array>} Array of ClassSessionDTO with attendance status for the student
 */
async function getSessionsWithStudentAttendance(courseOfferingId, studentId) {
  const classSessionRepo = new ClassSessionRepository();
  const attendanceRepo = new AttendanceRepository();
  const sessions = await classSessionRepo.findAll({ courseOfferingId });

  return Promise.all(sessions.map(async (session) => {
    const dto = new ClassSessionDTO(session);
    // Get this student's attendance record for this session
    const attendance = await attendanceRepo.findBySessionAndStudent(session.id, studentId);
    if (attendance) {
      dto.studentAttendanceStatus = attendance.status; // present, absent, late, excused
    } else {
      dto.studentAttendanceStatus = 'not_marked';
    }
    return dto;
  }));
}

module.exports = { getSessionsWithStudentAttendance };
