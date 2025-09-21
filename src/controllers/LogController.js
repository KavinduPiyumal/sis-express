const LogRepository = require('../repositories/LogRepository');
const logRepository = new LogRepository();

class LogController {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, userId, action, entity, startDate, endDate } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entity) where.entity = entity;
      if (startDate && endDate) {
        where.timestamp = { $between: [startDate, endDate] };
      }
      const logs = await logRepository.model.findAndCountAll({
        where,
        order: [['timestamp', 'DESC']],
        offset,
        limit: parseInt(limit)
      });
      res.json({ success: true, ...logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogController();
