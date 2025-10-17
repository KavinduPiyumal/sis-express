const { AttendanceRepository, UserRepository } = require('../repositories');
const { AttendanceDTO, AttendanceCreateDTO, AttendanceUpdateDTO } = require('../dto/AttendanceDTO');
const socketService = require('../infrastructure/socketService');
const emailService = require('../infrastructure/emailService');
const logger = require('../config/logger');

class AttendanceUseCase {
  // Student: Get per-course offering attendance stats (summary for all enrolled courses)
  async getMyOfferingsStats(studentId) {
    // Get all active enrollments for the student
    const EnrollmentRepository = require('../repositories/EnrollmentRepository');
    const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
    const ClassSessionRepository = require('../repositories/ClassSessionRepository');
    const enrollmentRepo = new EnrollmentRepository();
    const courseOfferingRepo = new CourseOfferingRepository();
    const classSessionRepo = new ClassSessionRepository();
    const attendanceRepo = this.attendanceRepository;

    const enrollments = await enrollmentRepo.findAll({ studentId, status: 'active' });
    const courseOfferingIds = enrollments.map(e => e.courseOfferingId);
    if (courseOfferingIds.length === 0) return { offerings: [], overall: null };
    // Load all related records for DTO (use findByFilters to always include all relations)
    const courseOfferings = await courseOfferingRepo.findByFilters(
      { id: { in: courseOfferingIds } }
    );



    logger.info('Course offerings for student attendance stats', { studentId, courseOfferings });
    

    // Get attendance threshold from env
    const attendanceThreshold = process.env.ATTENDANCE_REQUIRED_PERCENT ? Number(process.env.ATTENDANCE_REQUIRED_PERCENT) : 75;

    let overallPresent = 0, overallExcused = 0, overallAbsent = 0, overallMarked = 0, overallSessions = 0;
    const offerings = [];
    for (const offering of courseOfferings) {
      const sessions = await classSessionRepo.findAll({ courseOfferingId: offering.id });
      let presentCount = 0, excusedCount = 0, absentCount = 0, markedCount = 0;
      for (const session of sessions) {
        const attendance = await attendanceRepo.findBySessionAndStudent(session.id, studentId);
        if (attendance) {
          markedCount++;
          if (attendance.status === 'present') presentCount++;
          else if (attendance.status === 'excused') excusedCount++;
          else if (attendance.status === 'absent') absentCount++;
        }
      }
      const averageAttendance = sessions.length > 0 ? ((presentCount + excusedCount) / sessions.length) * 100 : 0;
      const CourseOfferingDTO = require('../dto/CourseOfferingDTO');
      const courseOfferingDTO = new CourseOfferingDTO(offering);
      offerings.push({
        courseOffering: courseOfferingDTO,
        semester: offering.semester,
        lecturer: offering.lecturer,
        sessionsCount: sessions.length,
        attendanceMarkedSessionsCount: markedCount,
        presentCount,
        excusedCount,
        absentCount,
        averageAttendance: Math.round(averageAttendance * 100) / 100
      });
      overallPresent += presentCount;
      overallExcused += excusedCount;
      overallAbsent += absentCount;
      overallMarked += markedCount;
      overallSessions += sessions.length;
    }
    const overallAttendancePercent = overallSessions > 0 ? ((overallPresent + overallExcused) / overallSessions) * 100 : 0;

    logger.info('offerings', { offerings });
    return {
      offerings,
      overall: {
        attendancePercent: Math.round(overallAttendancePercent * 100) / 100,
        attended: overallPresent + overallExcused,
        total: overallSessions,
        present: overallPresent,
        excused: overallExcused,
        absent: overallAbsent,
        marked: overallMarked,
        attendanceThreshold
      }
    };
  }

  // Student: Get detailed session+attendance data for a given course offering
  async getMyOfferingSessions(studentId, courseOfferingId) {
    const ClassSessionRepository = require('../repositories/ClassSessionRepository');
    const classSessionRepo = new ClassSessionRepository();
    const attendanceRepo = this.attendanceRepository;
    const sessions = await classSessionRepo.findAll({ courseOfferingId });
    let presentCount = 0, excusedCount = 0, absentCount = 0, markedSessionsCount = 0;
    const sessionData = await Promise.all(sessions.map(async (session) => {
      const attendance = await attendanceRepo.findBySessionAndStudent(session.id, studentId);
      if (attendance) {
        markedSessionsCount++;
        if (attendance.status === 'present') presentCount++;
        else if (attendance.status === 'excused') excusedCount++;
        else if (attendance.status === 'absent') absentCount++;
      }
      return {
        session,
        attendance: attendance ? new AttendanceDTO(attendance) : null
      };
    }));
    return {
      sessions: sessionData,
      stats: {
        totalSessions: sessions.length,
        presentCount,
        absentCount,
        excusedCount,
        markedSessionsCount,
        remainingSessionCount: sessions.length - markedSessionsCount
      }
    };
  }
  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.userRepository = new UserRepository();
  }

  async createAttendance(attendanceData, userRole) {
    try {
      // Only admins can record attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can record attendance');
      }

      // Validate student exists (use Student repository)
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findById(attendanceData.studentId);
      if (!student) {
        throw new Error('Invalid student');
      }


      // Check if attendance already exists for this class session
      const existingAttendance = await this.attendanceRepository.findBySessionAndStudent(
        attendanceData.classSessionId,
        attendanceData.studentId
      );
      if (existingAttendance) {
        throw new Error('Attendance already recorded for this session');
      }

      const createAttendanceDTO = new AttendanceCreateDTO(attendanceData);
      const attendance = await this.attendanceRepository.create(createAttendanceDTO);

      // Fetch attendance with related data
      const fullAttendance = await this.attendanceRepository.findById(attendance.id, {
        include: [
          { association: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] },
          { association: 'recorder', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });


      // Send notification if absent
      if (attendance.status === 'absent') {
        const notificationTitle = 'Attendance Alert';
        const notificationMessage = `You were marked absent for session ${attendance.classSessionId} in course offering ${attendance.courseOfferingId}`;
        socketService.notifyUser(student.id, notificationTitle, notificationMessage, 'attendance');
        emailService.sendNotificationEmail(student, notificationTitle, notificationMessage, 'attendance');
      }

      return new AttendanceDTO(fullAttendance);
    } catch (error) {
      logger.error('Create attendance error:', error);
      throw error;
    }
  }

  async updateAttendance(attendanceId, updateData, userRole, requestorUserId) {
    try {
      // Only admins can update attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can update attendance');
      }

      const attendance = await this.attendanceRepository.findById(attendanceId);
      if (!attendance) {
        throw new Error('Attendance record not found');
      }

            // allow only the lecturer assigned to the course offering to delete
      const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
      const LecturerRepository = require('../repositories/LecturerRepository');
      const courseOfferingRepo = new CourseOfferingRepository();
      const lecturerRepo = new LecturerRepository();

      const offering = await courseOfferingRepo.findById(attendance.courseOfferingId);
      if (!offering) {
        throw new Error('Associated course offering not found');
      }

      // Find lecturer record for requestor userId
      const lecturer = await lecturerRepo.findByUserId(requestorUserId);
      if (!lecturer) {
        throw new Error('Lecturer record not found for this user');
      }

      if (offering.lecturerId !== lecturer.id) {
        throw new Error('Only the assigned lecturer or admins can delete this attendance record');
      }

      const updateAttendanceDTO = new AttendanceUpdateDTO(updateData);
      await this.attendanceRepository.update(attendanceId, updateAttendanceDTO);

      const updatedAttendance = await this.attendanceRepository.findById(attendanceId, {
        include: [
          { association: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] },
          { association: 'recorder', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      return new AttendanceDTO(updatedAttendance);
    } catch (error) {
      logger.error('Update attendance error:', error);
      throw error;
    }
  }

  async deleteAttendance(attendanceId, userRole, requestorUserId) {
    try {
      // Find existing attendance
      const existing = await this.attendanceRepository.findById(attendanceId);
      if (!existing) {
        throw new Error('Attendance record not found');
      }

      // allow only the lecturer assigned to the course offering to delete
      const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
      const LecturerRepository = require('../repositories/LecturerRepository');
      const courseOfferingRepo = new CourseOfferingRepository();
      const lecturerRepo = new LecturerRepository();

      const offering = await courseOfferingRepo.findById(existing.courseOfferingId);
      if (!offering) {
        throw new Error('Associated course offering not found');
      }

      // Find lecturer record for requestor userId
      const lecturer = await lecturerRepo.findByUserId(requestorUserId);
      if (!lecturer) {
        throw new Error('Lecturer record not found for this user');
      }

      if (offering.lecturerId !== lecturer.id) {
        throw new Error('Only the assigned lecturer or admins can delete this attendance record');
      }

      await this.attendanceRepository.delete(attendanceId);
      return { success: true };
    } catch (error) {
      logger.error('Delete attendance error:', error);
      throw error;
    }
  }

  async bulkDeleteAttendance(attendanceIds = [], userRole, requestorUserId) {
    try {
      const results = {
        successCount: 0,
        failedCount: 0,
        failedRecords: []
      };

      for (const id of attendanceIds) {
        try {
          // reuse deleteAttendance logic which enforces permissions
          await this.deleteAttendance(id, userRole, requestorUserId);
          results.successCount++;
        } catch (err) {
          results.failedCount++;
          results.failedRecords.push({ id, reason: err.message });
        }
      }

      return results;
    } catch (error) {
      logger.error('Bulk delete attendance error:', error);
      throw error;
    }
  }

  async getAttendanceByStudent(studentId, requestorId, requestorRole, options = {}) {
    try {

      // Students can only view their own attendance, admins can view any
      if (requestorRole === 'student') {
                // Lookup studentId from userId
        const StudentRepository = require('../repositories/StudentRepository');
        const studentRepo = new StudentRepository();
        const student = await studentRepo.findOne({ userId: requestorId });
        if (!student) {
          throw new Error('Student record not found for user');
        }
        const requestorStudentId = student.id;
        if (studentId !== requestorStudentId) {
          throw new Error('Students can only view their own attendance');
        }
      }
      if (requestorRole !== 'admin' && requestorRole !== 'super_admin' && requestorRole !== 'student') {
        throw new Error('Insufficient permissions');
      }

      // Get only active enrollments for the student
      const EnrollmentRepository = require('../repositories/EnrollmentRepository');
      const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
      const ClassSessionRepository = require('../repositories/ClassSessionRepository');
      const enrollmentRepo = new EnrollmentRepository();
      const courseOfferingRepo = new CourseOfferingRepository();
      const classSessionRepo = new ClassSessionRepository();

      // Only active enrollments
      const enrollments = await enrollmentRepo.findAll({ studentId, status: 'active' });
      const courseOfferingIds = enrollments.map(e => e.courseOfferingId);
      if (courseOfferingIds.length === 0) {
        return { attendanceByCourseOffering: [] };
      }
      const courseOfferings = await courseOfferingRepo.findAll({ id: { in: courseOfferingIds } });

      // For each course offering, get sessions and attendance for this student
      const attendanceRepo = this.attendanceRepository;
      const grouped = [];
      for (const offering of courseOfferings) {
        // Get all sessions for this offering
        const sessions = await classSessionRepo.findAll({ courseOfferingId: offering.id });
        // For each session, get attendance for this student
        const sessionData = [];
        for (const session of sessions) {
          const attendance = await attendanceRepo.findBySessionAndStudent(session.id, studentId);
          sessionData.push({
            session,
            attendance: attendance ? new AttendanceDTO(attendance) : null
          });
        }
        grouped.push({
          courseOffering: offering,
          sessions: sessionData
        });
      }

      return {
        attendanceByCourseOffering: grouped
      };
    } catch (error) {
      logger.error('Get attendance by student error:', error);
      throw error;
    }
  }

  async getAllAttendance(userRole, options = {}) {
    try {
      // Only admins can view all attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can view all attendance records');
      }

      const { status, courseOfferingId, classSessionId, studentId, page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (status) whereClause.status = status;
      if (courseOfferingId) whereClause.courseOfferingId = courseOfferingId;
      if (classSessionId) whereClause.classSessionId = classSessionId;
      if (studentId) whereClause.studentId = studentId;

      const result = await this.attendanceRepository.findAndCountAll({
        where: whereClause,
        include: [
          // student relation will be enriched below with full user details
          { association: 'student', attributes: ['id', 'studentId'] },
          { association: 'recorder', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['markedAt', 'DESC'], ['createdAt', 'DESC']]
      });

      // Batch-load student details (including related user) to avoid N+1
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const studentIds = Array.from(new Set(result.rows.map(r => r.studentId).filter(Boolean)));
      let studentsById = {};
      if (studentIds.length > 0) {
        const students = await studentRepo.findAll({ id: { in: studentIds } }, {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true }
            }
          }
        });
        studentsById = students.reduce((acc, s) => {
          acc[s.id] = s;
          return acc;
        }, {});
      }

      const attendanceDTOs = result.rows.map(attendance => {
        // attach student details if available
        if (!attendance.student && attendance.studentId && studentsById[attendance.studentId]) {
          attendance.student = studentsById[attendance.studentId];
        }
        return new AttendanceDTO(attendance);
      });

      return {
        attendance: attendanceDTOs,
        meta: {
          totalCount: result.count,
          totalPages: Math.ceil(result.count / limit),
          currentPage: parseInt(page)
        }
      };
    } catch (error) {
      logger.error('Get all attendance error:', error);
      throw error;
    }
  }

  async getAttendanceStats(studentId, requestorId, requestorRole, options = {}) {
    try {
      // Students can only view their own stats, admins can view any
      if (requestorRole === 'student') {
                // Lookup studentId from userId
        const StudentRepository = require('../repositories/StudentRepository');
        const studentRepo = new StudentRepository();
        const student = await studentRepo.findOne({ userId: requestorId });
        if (!student) {
          throw new Error('Student record not found for user');
        }
        const requestorStudentId = student.id;
        if (studentId !== requestorStudentId) {
          throw new Error('Students can only view their own attendance');
        }
      }
      if (requestorRole !== 'admin' && requestorRole !== 'super_admin' && requestorRole !== 'student') {
        throw new Error('Insufficient permissions');
      }

      // Get all enrollments for the student
      const EnrollmentRepository = require('../repositories/EnrollmentRepository');
      const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
      const ClassSessionRepository = require('../repositories/ClassSessionRepository');
      const enrollmentRepo = new EnrollmentRepository();
      const courseOfferingRepo = new CourseOfferingRepository();
      const classSessionRepo = new ClassSessionRepository();

      const enrollments = await enrollmentRepo.findAll({ studentId, status: 'active' });
      const courseOfferingIds = enrollments.map(e => e.courseOfferingId);
      const courseOfferings = await courseOfferingRepo.findAll({ id: { in: courseOfferingIds } });

      // For each course offering, get sessions and stats for this student
      const attendanceRepo = this.attendanceRepository;
      const groupedStats = [];

      for (const offering of courseOfferings) {
        // Get all sessions for this offering
        const sessions = await classSessionRepo.findAll({ courseOfferingId: offering.id });
        // For each session, get attendance and stats for this student
        const sessionStats = [];
        for (const session of sessions) {
          const attendance = await attendanceRepo.findBySessionAndStudent(session.id, studentId);
          let status = attendance ? attendance.status : 'not_marked';
          sessionStats.push({
            classSession: session,
            status
          });
        }
        // Offering-level stats
        const totalSessions = sessions.length;
        const present = sessionStats.filter(s => s.status === 'present').length;
        const absent = sessionStats.filter(s => s.status === 'absent').length;
        const excused = sessionStats.filter(s => s.status === 'excused').length;
        const notMarked = sessionStats.filter(s => s.status === 'not_marked').length;
        const attendancePercentage = totalSessions > 0 ? ((present + excused) / totalSessions) * 100 : 0;
        groupedStats.push({
          courseOffering: offering,
          totalSessions,
          present,
          absent,
          excused,
          notMarked,
          attendancePercentage: Math.round(attendancePercentage * 100) / 100,
          sessions: sessionStats
        });
      }

      return {
        statsByCourseOffering: groupedStats
      };
    } catch (error) {
      logger.error('Get attendance stats error:', error);
      throw error;
    }
  }

  // Admin: Get attendance stats for all course offerings assigned to the admin (lecturer)
  async getAdminCourseOfferingStats(adminUserId) {
    try {
      // Find lecturerId for this admin userId
      const CourseOfferingRepository = require('../repositories/CourseOfferingRepository');
      const ClassSessionRepository = require('../repositories/ClassSessionRepository');
      const EnrollmentRepository = require('../repositories/EnrollmentRepository');
      const LecturerRepository = require('../repositories/LecturerRepository');
      const attendanceRepo = this.attendanceRepository;
      const courseOfferingRepo = new CourseOfferingRepository();
      const classSessionRepo = new ClassSessionRepository();
      const enrollmentRepo = new EnrollmentRepository();
      const lecturerRepo = new LecturerRepository();

      // Look up lecturer by userId
      const lecturer = await lecturerRepo.findByUserId(adminUserId);
      if (!lecturer) {
        throw new Error('Lecturer not found for this user');
      }
      const lecturerId = lecturer.id;

      // Get all course offerings assigned to this lecturer
      const offerings = await courseOfferingRepo.findAll({ lecturerId });
      const statsByOffering = [];

      for (const offering of offerings) {
        // Get all sessions for this offering
        const sessions = await classSessionRepo.findAll({ courseOfferingId: offering.id });
        let marked = 0, notMarked = 0;
        let sessionPercentages = [];
        let classSessions = [];

        for (const session of sessions) {
          // Get all attendance records for this session
          const attendanceRecords = await attendanceRepo.findAll({ classSessionId: session.id });

          // Build base session object
          const sessionObj = {
            id: session.id,
            courseOfferingId: session.courseOfferingId,
            date: session.date,
            topic: session.topic,
            location: session.location,
            remarks: session.remarks,
            durationMinutes: session.durationMinutes
          };

          if (attendanceRecords.length === 0) {
            // Session not marked - no attendance object
            notMarked++;
            classSessions.push(sessionObj);
          } else {
            // Session marked - calculate attendance
            marked++;
            let sessionPresent = 0, sessionAbsent = 0, sessionExcused = 0;

            for (const record of attendanceRecords) {
              if (record.status === 'present') sessionPresent++;
              else if (record.status === 'absent') sessionAbsent++;
              else if (record.status === 'excused') sessionExcused++;
            }

            // Calculate session attendance percentage (present+excused)/total marked
            const totalMarked = sessionPresent + sessionAbsent + sessionExcused;
            const attendancePercentageForSession = totalMarked > 0
              ? Math.round(((sessionPresent + sessionExcused) / totalMarked) * 100)
              : 0;

            sessionPercentages.push(attendancePercentageForSession);

            // Add attendance data to session object
            sessionObj.attendance = {
              present: sessionPresent,
              absent: sessionAbsent,
              excused: sessionExcused,
              attendancePercentageForSession
            };

            classSessions.push(sessionObj);
          }
        }

        const totalSessions = sessions.length;
        const attendancePercentageForCourseOffering = sessionPercentages.length > 0
          ? Math.round(sessionPercentages.reduce((a, b) => a + b, 0) / sessionPercentages.length)
          : 0;

        statsByOffering.push({
          courseOffering: {
            ...offering,
            classSessions,
            totalSessions,
            marked,
            notMarked,
            attendancePercentageForCourseOffering
          }
        });
      }

      return { statsByOffering };
    } catch (error) {
      logger.error('Get admin course offering stats error:', error);
      throw error;
    }
  }

  async bulkCreateAttendance(attendanceRecords, recordedBy, userRole) {
    try {
      // Only admins can bulk record attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can record bulk attendance');
      }

      // attendanceRecords should be an object: { records: [], failed: [] }
      const { records, failed } = attendanceRecords;
      let result = [];
      if (records && records.length > 0) {
        // The Attendance model expects `markedBy` (user id). Map recordedBy -> markedBy.
        const processedRecords = records.map(record => ({
          ...record,
          markedBy: recordedBy
        }));
        result = await this.attendanceRepository.bulkCreateAttendance(processedRecords);
      }
      return {
        successCount: result.length,
        failedCount: failed ? failed.length : 0,
        failedRecords: failed || []
      };
    } catch (error) {
      logger.error('Bulk create attendance error:', error);
      throw error;
    }
  }

}

module.exports = AttendanceUseCase;
