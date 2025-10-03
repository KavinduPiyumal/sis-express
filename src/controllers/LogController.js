const LogRepository = require('../repositories/LogRepository');
const logRepository = new LogRepository();

class LogController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, userId, action, entity, startDate, endDate } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
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

      // Get logs with pagination using Prisma
      const [logs, totalCount] = await Promise.all([
        logRepository.findAllWithPagination(where, skip, take),
        logRepository.count(where)
      ]);

      res.json({ 
        success: true, 
        data: logs,
        count: totalCount,
        totalPages: Math.ceil(totalCount / take),
        currentPage: parseInt(page)
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
