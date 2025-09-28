
const prisma = require('../infrastructure/prisma');

class LogRepository {
  async findByUserId(userId) {
    return await prisma.log.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByAction(action) {
    return await prisma.log.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByEntity(entity) {
    return await prisma.log.findMany({
      where: { entity },
      orderBy: { timestamp: 'desc' },
    });
  }

  async findByDateRange(startDate, endDate) {
    return await prisma.log.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getLogStats(startDate, endDate) {
    const where = startDate && endDate ? {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    } : {};

    const totalLogs = await prisma.log.count({ where });

    // Group by action
    const actionStatsRaw = await prisma.log.groupBy({
      by: ['action'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    // Group by entity
    const entityStatsRaw = await prisma.log.groupBy({
      by: ['entity'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return {
      totalLogs,
      actionStats: actionStatsRaw.map(stat => ({
        action: stat.action,
        count: stat._count.id,
      })),
      entityStats: entityStatsRaw.map(stat => ({
        entity: stat.entity,
        count: stat._count.id,
      })),
    };
  }

  async create(data) {
    return await prisma.log.create({ data });
  }

  async findAll(filter = {}) {
    return await prisma.log.findMany({ where: filter });
  }

  async findById(id) {
    return await prisma.log.findUnique({ where: { id } });
  }

  async delete(id) {
    return await prisma.log.delete({ where: { id } });
  }
}

module.exports = LogRepository;
