
const AttendanceUseCase = require('../usecases/AttendanceUseCase');

class AttendanceController {
  // Student: Get per-course offering attendance stats (summary for all enrolled courses)
  getMyOfferingsStats = async (req, res, next) => {
    try {
      // Lookup studentId from userId
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found for user' });
      }
      // Get stats for all enrolled course offerings
      const stats = await this.attendanceUseCase.getMyOfferingsStats(student.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };

  // Student: Get detailed session+attendance data for a given course offering
  getMyOfferingSessions = async (req, res, next) => {
    try {
      // Lookup studentId from userId
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student record not found for user' });
      }
      const courseOfferingId = req.params.courseOfferingId;
      if (!courseOfferingId) {
        return res.status(400).json({ success: false, message: 'courseOfferingId is required' });
      }
      // Get session+attendance data for this course offering
      const result = await this.attendanceUseCase.getMyOfferingSessions(student.id, courseOfferingId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
  constructor() {
    this.attendanceUseCase = new AttendanceUseCase();
  }

  // Admin: Get attendance stats for all course offerings assigned to the admin (lecturer)
  getAdminCourseOfferingStats = async (req, res, next) => {
    try {
      // Only admin or super_admin can access
      if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      // userId is the lecturer/admin's user id
      const userId = req.user.id;
      const { statsByOffering } = await this.attendanceUseCase.getAdminCourseOfferingStats(userId);
      res.json({ success: true, data: { statsByOffering } });
    } catch (error) {
      next(error);
    }
  };

  createAttendance = async (req, res, next) => {
    try {
      const { studentNo, ...rest } = req.body;
      // Lookup studentId from studentNo
      const studentModel = require('../repositories/StudentRepository');
      const studentRepo = new studentModel();
      const student = await studentRepo.findByStudentNo(studentNo);
      if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found for studentNo' });
      }
      const attendanceData = {
        ...rest,
        studentId: student.id,
        recordedBy: req.user.id,
        markedAt: rest.markedAt || new Date()
      };
      const attendance = await this.attendanceUseCase.createAttendance(
        attendanceData,
        req.user.role
      );
      res.status(201).json({
        success: true,
        message: 'Attendance recorded successfully',
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  };

  updateAttendance = async (req, res, next) => {
    try {
      const { id } = req.params;
      const attendance = await this.attendanceUseCase.updateAttendance(
        id,
        req.body,
        req.user.role,
        req.user.id
      );
      
      res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  };

  deleteAttendance = async (req, res, next) => {
    try {
      const { id } = req.params;
      // pass both role and userId so usecase can validate lecturer ownership
      await this.attendanceUseCase.deleteAttendance(id, req.user.role, req.user.id);
      res.json({ success: true, message: 'Attendance deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getAttendanceByStudent = async (req, res, next) => {
    try {
      // For /me route, resolve studentId from userId
      let studentId = req.params.studentId;
      if (!studentId && req.user.role === 'student') {
        // Lookup studentId from userId
        const StudentRepository = require('../repositories/StudentRepository');
        const studentRepo = new StudentRepository();
        const student = await studentRepo.findOne({ userId: req.user.id });
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student record not found for user' });
        }
        studentId = student.id;
      } else if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required' });
      }
      const { startDate, endDate, page, limit } = req.query;
      const options = { startDate, endDate, page, limit };
      const result = await this.attendanceUseCase.getAttendanceByStudent(
        studentId,
        req.user.id,
        req.user.role,
        options
      );
      res.json({
        success: true,
        data: result.attendanceByCourseOffering
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAttendance = async (req, res, next) => {
    try {
      // Extract query parameters
      const { courseOfferingId, classSessionId, studentId, status, page, limit } = req.query;
      const options = { courseOfferingId, classSessionId, studentId, status, page, limit };

      const result = await this.attendanceUseCase.getAllAttendance(
        req.user.role,
        options
      );
      
      res.json({
        success: true,
        data: result.attendance,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  };

  getAttendanceStats = async (req, res, next) => {
    try {
      // For /me route, resolve studentId from userId
      let studentId = req.params.studentId;
      if (!studentId && req.user.role === 'student') {
        // Lookup studentId from userId
        const StudentRepository = require('../repositories/StudentRepository');
        const studentRepo = new StudentRepository();
        const student = await studentRepo.findOne({ userId: req.user.id });
        if (!student) {
          return res.status(404).json({ success: false, message: 'Student record not found for user' });
        }
        studentId = student.id;
      } else if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required' });
      }
      const { startDate, endDate } = req.query;
      
      const stats = await this.attendanceUseCase.getAttendanceStats(
        studentId,
        req.user.id,
        req.user.role,
        { startDate, endDate }
      );
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  bulkCreateAttendance = async (req, res, next) => {
    try {
      const { attendanceRecords } = req.body;
      const studentModel = require('../repositories/StudentRepository');
      const studentRepo = new studentModel();
      // Map studentNo to studentId for each record
      const recordsWithIds = [];
      const failed = [];
      for (const record of attendanceRecords) {
        const student = await studentRepo.findByStudentNo(record.studentNo);
        if (!student) {
          failed.push({ ...record, reason: `Student not found for studentNo: ${record.studentNo}` });
          continue;
        }
        recordsWithIds.push({
          ...record,
          studentId: student.id,
          markedAt: record.markedAt || new Date()
        });
      }
      // Remove studentNo from each record
      const finalRecords = recordsWithIds.map(r => {
        const { studentNo, ...rest } = r;
        return rest;
      });
      // Pass both records and failed to use case
      const result = await this.attendanceUseCase.bulkCreateAttendance(
        { records: finalRecords, failed },
        req.user.id,
        req.user.role
      );
      res.status(201).json({
        success: true,
        message: 'Bulk attendance processed',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  bulkDeleteAttendance = async (req, res, next) => {
    try {
      const { attendanceIds } = req.body;
      // pass user role and id for per-item authorization
      const result = await this.attendanceUseCase.bulkDeleteAttendance(attendanceIds, req.user.role, req.user.id);
      res.json({ success: true, message: 'Bulk delete processed', data: result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AttendanceController();
