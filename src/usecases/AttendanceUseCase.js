const { AttendanceRepository, UserRepository } = require('../repositories');
const { AttendanceDTO, AttendanceCreateDTO, AttendanceUpdateDTO } = require('../dto/AttendanceDTO');
const socketService = require('../infrastructure/socketService');
const emailService = require('../infrastructure/emailService');
const logger = require('../config/logger');
const { Op } = require('sequelize');

class AttendanceUseCase {
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

      // Validate student exists
      const student = await this.userRepository.findById(attendanceData.studentId);
      if (!student || student.role !== 'student') {
        throw new Error('Invalid student ID');
      }

      // Check if attendance already exists for this date
      const existingAttendance = await this.attendanceRepository.findByStudentAndDate(
        attendanceData.studentId,
        attendanceData.date
      );

      if (existingAttendance) {
        throw new Error('Attendance already recorded for this date');
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
        const notificationMessage = `You were marked absent on ${attendance.date}${attendance.subject ? ` for ${attendance.subject}` : ''}`;
        
        socketService.notifyUser(student.id, notificationTitle, notificationMessage, 'attendance');
        emailService.sendNotificationEmail(student, notificationTitle, notificationMessage, 'attendance');
      }

      return new AttendanceDTO(fullAttendance);
    } catch (error) {
      logger.error('Create attendance error:', error);
      throw error;
    }
  }

  async updateAttendance(attendanceId, updateData, userRole) {
    try {
      // Only admins can update attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can update attendance');
      }

      const attendance = await this.attendanceRepository.findById(attendanceId);
      if (!attendance) {
        throw new Error('Attendance record not found');
      }

      const updateAttendanceDTO = new AttendanceUpdateDTO(updateData);
      await this.attendanceRepository.update(updateAttendanceDTO, { id: attendanceId });

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

  async getAttendanceByStudent(studentId, requestorId, requestorRole, options = {}) {
    try {
      // Students can only view their own attendance, admins can view any
      if (requestorRole === 'student' && studentId !== requestorId) {
        throw new Error('Students can only view their own attendance');
      }

      if (requestorRole !== 'admin' && requestorRole !== 'super_admin' && requestorRole !== 'student') {
        throw new Error('Insufficient permissions');
      }

      const { startDate, endDate, page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      let whereClause = { studentId };
      if (startDate && endDate) {
        whereClause = {
          ...whereClause,
          date: {
            [Op.between]: [startDate, endDate]
          }
        };
      }

      const result = await this.attendanceRepository.findAndCountAll({
        where: whereClause,
        include: [
          { association: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] },
          { association: 'recorder', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['date', 'DESC']]
      });

      return {
        attendance: result.rows.map(attendance => new AttendanceDTO(attendance)),
        meta: {
          totalCount: result.count,
          totalPages: Math.ceil(result.count / limit),
          currentPage: parseInt(page)
        }
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

      const { date, subject, status, page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      let whereClause = {};
      if (date) whereClause.date = date;
      if (subject) whereClause.subject = { [Op.iLike]: `%${subject}%` };
      if (status) whereClause.status = status;

      const result = await this.attendanceRepository.findAndCountAll({
        where: whereClause,
        include: [
          { association: 'student', attributes: ['id', 'firstName', 'lastName', 'studentId'] },
          { association: 'recorder', attributes: ['id', 'firstName', 'lastName'] }
        ],
        limit: parseInt(limit),
        offset,
        order: [['date', 'DESC'], ['createdAt', 'DESC']]
      });

      return {
        attendance: result.rows.map(attendance => new AttendanceDTO(attendance)),
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
      if (requestorRole === 'student' && studentId !== requestorId) {
        throw new Error('Students can only view their own attendance statistics');
      }

      if (requestorRole !== 'admin' && requestorRole !== 'super_admin' && requestorRole !== 'student') {
        throw new Error('Insufficient permissions');
      }

      const { startDate, endDate } = options;
      const stats = await this.attendanceRepository.getAttendanceStats(studentId, startDate, endDate);

      return stats;
    } catch (error) {
      logger.error('Get attendance stats error:', error);
      throw error;
    }
  }

  async bulkCreateAttendance(attendanceRecords, recordedBy, userRole) {
    try {
      // Only admins can bulk record attendance
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        throw new Error('Only admins can record bulk attendance');
      }

      // Add recordedBy to all records
      const processedRecords = attendanceRecords.map(record => ({
        ...record,
        recordedBy
      }));

      const result = await this.attendanceRepository.bulkCreateAttendance(processedRecords);

      return {
        message: `Successfully processed ${result.length} attendance records`,
        count: result.length
      };
    } catch (error) {
      logger.error('Bulk create attendance error:', error);
      throw error;
    }
  }
}

module.exports = AttendanceUseCase;
