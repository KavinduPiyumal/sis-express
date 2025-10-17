const LogRepository = require('../repositories/LogRepository');
const logRepository = new LogRepository();

class LogController {
  async getAll(req, res, next) {
    try {
      // For lazy loading, use cursor-based pagination if cursor param is provided, else fallback to page/limit
      const { limit = 20, cursor, userId, action, entity, startDate, endDate } = req.query;
      const take = parseInt(limit);

      // Build where clause for Prisma
      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entity) where.entity = entity;
      if (startDate && endDate) {
        where.timestamp = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      // If cursor is provided, use cursor-based pagination
      let logs;
      if (cursor) {
        logs = await logRepository.findAllWithCursor(where, cursor, take + 1); // fetch one extra to check hasMore
      } else {
        logs = await logRepository.findAllWithPagination(where, 0, take + 1); // fallback to first page
      }

      let hasMore = false;
      if (logs.length > take) {
        hasMore = true;
        logs = logs.slice(0, take);
      }
      const nextCursor = hasMore ? logs[logs.length - 1].id : null;

      res.json({
        success: true,
        data: logs,
        hasMore,
        nextCursor
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const log = await logRepository.findById(req.params.id);
      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }
      res.json({
        success: true,
        data: log
      });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await logRepository.getLogStats(
        startDate ? new Date(startDate) : null,
        endDate ? new Date(endDate) : null
      );
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const log = await logRepository.delete(req.params.id);
      res.json({
        success: true,
        message: 'Log deleted successfully',
        data: log
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Log not found'
        });
      }
      next(error);
    }
  }
}

module.exports = new LogController();
