const BaseRepository = require('./BaseRepository');
const { Log } = require('../entities');
const { Op } = require('sequelize');

class LogRepository extends BaseRepository {
  constructor() {
    super(Log);
  }

  async findByUserId(userId, options = {}) {
    return await this.findAll({ 
      where: { userId }, 
      order: [['timestamp', 'DESC']], 
      ...options 
    });
  }

  async findByAction(action, options = {}) {
    return await this.findAll({ 
      where: { action }, 
      order: [['timestamp', 'DESC']], 
      ...options 
    });
  }

  async findByEntity(entity, options = {}) {
    return await this.findAll({ 
      where: { entity }, 
      order: [['timestamp', 'DESC']], 
      ...options 
    });
  }

  async findByDateRange(startDate, endDate, options = {}) {
    return await this.findAll({
      where: {
        timestamp: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['timestamp', 'DESC']],
      ...options
    });
  }

  async getLogStats(startDate, endDate) {
    const whereClause = {};
    
    if (startDate && endDate) {
      whereClause.timestamp = {
        [Op.between]: [startDate, endDate]
      };
    }

    const totalLogs = await this.count(whereClause);
    
    // Get logs by action
    const actionStats = await this.model.findAll({
      where: whereClause,
      attributes: [
        'action',
        [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']
      ],
      group: ['action'],
      order: [[this.model.sequelize.literal('count'), 'DESC']]
    });

    // Get logs by entity
    const entityStats = await this.model.findAll({
      where: whereClause,
      attributes: [
        'entity',
        [this.model.sequelize.fn('COUNT', this.model.sequelize.col('id')), 'count']
      ],
      group: ['entity'],
      order: [[this.model.sequelize.literal('count'), 'DESC']]
    });

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: parseInt(stat.dataValues.count)
      })),
      entityStats: entityStats.map(stat => ({
        entity: stat.entity,
        count: parseInt(stat.dataValues.count)
      }))
    };
  }
}

module.exports = LogRepository;
