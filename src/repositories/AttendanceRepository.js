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
      order: [['markedAt', 'DESC']],
      ...options
    });
  }

  async findBySessionAndStudent(classSessionId, studentId) {
    return await this.findOne({ classSessionId, studentId });
  }

  async findByDateRangeForOffering(courseOfferingId, startDate, endDate, options = {}) {
    return await this.findAll({
      where: {
        courseOfferingId,
        markedAt: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['markedAt', 'DESC']],
      ...options
    });
  }

  async getAttendanceStats(studentId, courseOfferingId) {
    const whereClause = { studentId, courseOfferingId };
    const totalSessions = await this.count(whereClause);
    const present = await this.count({ ...whereClause, status: 'present' });
    const absent = await this.count({ ...whereClause, status: 'absent' });
    const late = await this.count({ ...whereClause, status: 'late' });
    const excused = await this.count({ ...whereClause, status: 'excused' });
    const attendancePercentage = totalSessions > 0 ? ((present + late + excused) / totalSessions) * 100 : 0;
    return {
      totalSessions,
      present,
      absent,
      late,
      excused,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100
    };
  }

  async bulkCreateAttendance(attendanceRecords) {
    return await this.model.bulkCreate(attendanceRecords, {
      updateOnDuplicate: ['status', 'remarks', 'updatedAt', 'medicalId']
    });
  }
}

module.exports = AttendanceRepository;
