
const prisma = require('../infrastructure/prisma');

class AttendanceRepository {
  async findByStudentId(studentId) {
    return await prisma.attendance.findMany({
      where: { studentId },
      orderBy: { markedAt: 'desc' },
    });
  }

  async findBySessionAndStudent(classSessionId, studentId) {
    return await prisma.attendance.findFirst({
      where: { classSessionId, studentId },
    });
  }

  async findByDateRangeForOffering(courseOfferingId, startDate, endDate) {
    return await prisma.attendance.findMany({
      where: {
        courseOfferingId,
        markedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { markedAt: 'desc' },
    });
  }

  async getAttendanceStats(studentId, courseOfferingId) {
    const where = { studentId, courseOfferingId };
    const totalSessions = await prisma.attendance.count({ where });
    const present = await prisma.attendance.count({ where: { ...where, status: 'present' } });
    const absent = await prisma.attendance.count({ where: { ...where, status: 'absent' } });
    const late = await prisma.attendance.count({ where: { ...where, status: 'late' } });
    const excused = await prisma.attendance.count({ where: { ...where, status: 'excused' } });
    const attendancePercentage = totalSessions > 0 ? ((present + late + excused) / totalSessions) * 100 : 0;
    return {
      totalSessions,
      present,
      absent,
      late,
      excused,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
    };
  }

  async bulkCreateAttendance(attendanceRecords) {
    // Prisma does not support updateOnDuplicate in createMany, so we need to upsert each record
    const results = [];
    for (const record of attendanceRecords) {
      const { classSessionId, studentId } = record;
      results.push(
        prisma.attendance.upsert({
          where: { classSessionId_studentId: { classSessionId, studentId } },
          update: {
            status: record.status,
            remarks: record.remarks,
            updatedAt: record.updatedAt,
            medicalId: record.medicalId,
          },
          create: record,
        })
      );
    }
    return await Promise.all(results);
  }

  async create(data) {
    return await prisma.attendance.create({ data });
  }

  async findAll(filter = {}) {
    return await prisma.attendance.findMany({ where: filter });
  }

  async findById(id) {
    return await prisma.attendance.findUnique({ where: { id } });
  }

  async update(id, data) {
    return await prisma.attendance.update({ where: { id }, data });
  }

  async delete(id) {
    return await prisma.attendance.delete({ where: { id } });
  }
}

module.exports = AttendanceRepository;
