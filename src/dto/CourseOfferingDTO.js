const { getSessionsWithAttendanceSummary } = require('../services/CourseOfferingSessionService');
const { getSessionsWithStudentAttendance } = require('../services/CourseOfferingStudentSessionService');

class CourseOfferingDTO {
  constructor(offering, sessions, enrollment) {
    this.id = offering.id;
    this.subjectId = offering.subjectId;
    this.semesterId = offering.semesterId;
    this.batchId = offering.batchId;
    this.lecturerId = offering.lecturerId;
    this.year = offering.year;
    this.mode = offering.mode;
    this.capacity = offering.capacity;
    this.createdAt = offering.createdAt;
    this.updatedAt = offering.updatedAt;
    
    // Include related records if available
    if (offering.subject) {
      this.subject = {
        id: offering.subject.id,
        code: offering.subject.code,
        name: offering.subject.name,
        credits: offering.subject.credits,
        description: offering.subject.description
      };
    }
    
    if (offering.semester) {
      this.semester = {
        id: offering.semester.id,
        name: offering.semester.name,
        startDate: offering.semester.startDate,
        endDate: offering.semester.endDate,
        status: offering.semester.status
      };
    }
    
    if (offering.batch) {
      this.batch = {
        id: offering.batch.id,
        name: offering.batch.name,
        startYear: offering.batch.startYear
      };
      
      if (offering.batch.program) {
        this.batch.program = {
          id: offering.batch.program.id,
          name: offering.batch.program.name,
          duration: offering.batch.program.duration
        };
        
        if (offering.batch.program.faculty) {
          this.batch.program.faculty = {
            id: offering.batch.program.faculty.id,
            name: offering.batch.program.faculty.name,
            deanName: offering.batch.program.faculty.deanName
          };
        }
        
        if (offering.batch.program.department) {
          this.batch.program.department = {
            id: offering.batch.program.department.id,
            name: offering.batch.program.department.name
          };
        }
      }
    }
    
    if (offering.lecturer) {
      this.lecturer = {
        id: offering.lecturer.id,
        lecturerId: offering.lecturer.lecturerId,
        status: offering.lecturer.status
      };
      
      if (offering.lecturer.user) {
        this.lecturer.user = {
          id: offering.lecturer.user.id,
          firstName: offering.lecturer.user.firstName,
          lastName: offering.lecturer.user.lastName,
          email: offering.lecturer.user.email
        };
      }
      
      if (offering.lecturer.department) {
        this.lecturer.department = {
          id: offering.lecturer.department.id,
          name: offering.lecturer.department.name
        };
      }
    }

    // Lightweight counts (if supplied by use case)
    if (typeof offering.enrollmentsCount !== 'undefined') {
      this.enrollmentsCount = offering.enrollmentsCount;
    }
    if (typeof offering.pendingEnrollmentsCount !== 'undefined') {
      this.pendingEnrollmentsCount = offering.pendingEnrollmentsCount;
    }
    if (typeof offering.sessionsMarkedCount !== 'undefined') {
      this.sessionsMarkedCount = offering.sessionsMarkedCount;
    }
    if (typeof offering.averageAttendanceRate !== 'undefined') {
      this.averageAttendanceRate = offering.averageAttendanceRate;
    }
    if (typeof offering.sessionsCount !== 'undefined') {
      this.sessionsCount = offering.sessionsCount;
    }
    if (typeof offering.resultsCount !== 'undefined') {
      this.resultsCount = offering.resultsCount;
    }
    

    // If student's own enrollment is provided, attach it (id, status, studentId)
    if (enrollment) {
      this.enrollment = {
        id: enrollment.id,
        status: enrollment.status
      };
      
      // Include studentId if provided
      if (enrollment.studentId) {
        this.enrollment.studentId = enrollment.studentId;
      }
    }

    // Attach sessions or counts
    if (sessions) {
      this.sessions = sessions;
    }
  }
}

// Helper to build DTO with sessions (all students summary)
CourseOfferingDTO.buildWithSessions = async function(offering) {
  const { getSessionsWithAttendanceSummary } = require('../services/CourseOfferingSessionService');
  const sessions = await getSessionsWithAttendanceSummary(offering.id);
  // compute average attendance rate across sessions that have attendance (or all sessions)
  try {
    // only include sessions where attendance has been marked
    const ratedSessions = sessions.filter(s => s.attendanceMarked === true && typeof s.attendanceRate !== 'undefined');
    if (ratedSessions.length > 0) {
      const avg = ratedSessions.reduce((sum, s) => sum + (Number(s.attendanceRate) || 0), 0) / ratedSessions.length;
      offering.averageAttendanceRate = Number(avg.toFixed(2));
    } else {
      offering.averageAttendanceRate = 0;
    }
  } catch (e) {
    offering.averageAttendanceRate = 0;
  }

  return new CourseOfferingDTO(offering, sessions);
};

// Helper to build DTO with counts only (lightweight for lecturer or student listing)
// Optionally pass enrollment (student's own)
CourseOfferingDTO.buildWithCounts = async function(offering, enrollment) {
  const EnrollmentRepository = require('../repositories/EnrollmentRepository');
  const ClassSessionRepository = require('../repositories/ClassSessionRepository');
  const enrollmentRepo = new EnrollmentRepository();
  const classSessionRepo = new ClassSessionRepository();

  const activeEnrollmentsCount = await enrollmentRepo.count({ courseOfferingId: offering.id, status: 'active' });
  const pendingEnrollmentsCount = await enrollmentRepo.count({ courseOfferingId: offering.id, status: 'pending' });
  const sessionsCount = await classSessionRepo.count ? await classSessionRepo.count({ courseOfferingId: offering.id }) : (await classSessionRepo.findAll({ courseOfferingId: offering.id })).length;
  const ResultRepository = require('../repositories/ResultRepository');
  const resultRepo = new ResultRepository();
  const resultsCount = await resultRepo.count({ courseOfferingId: offering.id });

  // compute how many sessions have attendance marked
  let sessionsMarkedCount = 0;
  try {
    const sessionsWithSummary = await getSessionsWithAttendanceSummary(offering.id);
    sessionsMarkedCount = sessionsWithSummary.filter(s => s.attendanceMarked).length;
    // also compute and attach average attendance rate using only marked sessions
    const rated = sessionsWithSummary.filter(s => s.attendanceMarked === true && typeof s.attendanceRate !== 'undefined');
    if (rated.length > 0) {
      const avg = rated.reduce((sum, s) => sum + (Number(s.attendanceRate) || 0), 0) / rated.length;
      offering.averageAttendanceRate = Number(avg.toFixed(2));
    } else {
      offering.averageAttendanceRate = 0;
    }
  } catch (e) {
    // If service fails, keep sessionsMarkedCount as 0
    sessionsMarkedCount = 0;
  }

  // attach counts to offering object for DTO
  offering.enrollmentsCount = activeEnrollmentsCount;
  offering.pendingEnrollmentsCount = pendingEnrollmentsCount;
  offering.sessionsCount = sessionsCount;
  offering.resultsCount = resultsCount;
  offering.sessionsMarkedCount = sessionsMarkedCount;

  return new CourseOfferingDTO(offering, null, enrollment);
};

// Helper to build DTO with sessions for a specific student (student attendance status)
CourseOfferingDTO.buildWithStudentSessions = async function(offering, studentId) {
  const { getSessionsWithStudentAttendance } = require('../services/CourseOfferingStudentSessionService');
  const sessions = await getSessionsWithStudentAttendance(offering.id, studentId);
  return new CourseOfferingDTO(offering, sessions);
};


module.exports = CourseOfferingDTO;

