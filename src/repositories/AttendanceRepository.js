const BaseRepository = require('./BaseRepository');
const { Attendance } = require('../entities');
const { Op } = require('sequelize');

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(Attendance);
  }

  async findByStudentId(studentId, options = {}) {
    return await this.findAll({ 
      where: { studentId }, 
      order: [['date', 'DESC']], 
      ...options 
    });
  }

  async findByDateRange(startDate, endDate, options = {}) {
    return await this.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'DESC']],
      ...options
    });
  }

  async findByStudentAndDate(studentId, date) {
    return await this.findOne({ studentId, date });
  }

  async getAttendanceStats(studentId, startDate, endDate) {
    const whereClause = { studentId };
    
    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalDays = await this.count(whereClause);
    const presentDays = await this.count({ ...whereClause, status: 'present' });
    const absentDays = await this.count({ ...whereClause, status: 'absent' });
    const lateDays = await this.count({ ...whereClause, status: 'late' });

    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100
    };
  }

  async getClassAttendanceByDate(date, options = {}) {
    return await this.findAll({
      where: { date },
      include: [
        {
          association: 'student',
          attributes: ['id', 'firstName', 'lastName', 'studentId']
        }
      ],
      ...options
    });
  }

  async bulkCreateAttendance(attendanceRecords) {
    return await this.model.bulkCreate(attendanceRecords, {
      updateOnDuplicate: ['status', 'notes', 'updatedAt']
    });
  }
}

module.exports = AttendanceRepository;
