const AttendanceUseCase = require('../usecases/AttendanceUseCase');

class AttendanceController {
  constructor() {
    this.attendanceUseCase = new AttendanceUseCase();
  }

  createAttendance = async (req, res, next) => {
    try {
      const attendanceData = {
        ...req.body,
        recordedBy: req.user.id
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
        req.user.role
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

  getAttendanceByStudent = async (req, res, next) => {
    try {
      const { studentId } = req.params;
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
        data: result.attendance,
        meta: result.meta
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAttendance = async (req, res, next) => {
    try {
      const { date, subject, status, page, limit } = req.query;
      const options = { date, subject, status, page, limit };
      
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
      const { studentId } = req.params;
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
      const result = await this.attendanceUseCase.bulkCreateAttendance(
        attendanceRecords,
        req.user.id,
        req.user.role
      );
      
      res.status(201).json({
        success: true,
        message: 'Bulk attendance recorded successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AttendanceController();
