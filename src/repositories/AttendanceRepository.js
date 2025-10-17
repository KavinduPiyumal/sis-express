const prisma = require('../infrastructure/prisma');

class AttendanceRepository {
  // Paginated, filtered query for attendance
  async findAndCountAll({ where = {}, limit = 10, offset = 0, orderBy = [{ markedAt: 'desc' }] }) {
    const [rows, count] = await Promise.all([
      prisma.attendance.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.attendance.count({ where })
    ]);
    return { rows, count };
  }
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
      // Only include valid Attendance model fields
      const createData = {
        classSessionId: record.classSessionId,
        courseOfferingId: record.courseOfferingId,
        markedBy: record.markedBy,
        status: record.status,
        remarks: record.remarks,
        studentId: record.studentId,
        markedAt: record.markedAt,
        medicalId: record.medicalId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt
      };
      // Remove undefined fields
      Object.keys(createData).forEach(key => createData[key] === undefined && delete createData[key]);
      const updateData = {
        status: record.status,
        remarks: record.remarks,
        updatedAt: record.updatedAt,
        medicalId: record.medicalId
      };
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
      results.push(
        prisma.attendance.upsert({
          where: { classSessionId_studentId: { classSessionId, studentId } },
          update: updateData,
          create: createData,
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
