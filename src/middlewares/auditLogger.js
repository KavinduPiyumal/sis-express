const { LogRepository } = require('../repositories');
const logger = require('../config/logger');

const logRepository = new LogRepository();

const auditLogger = (action, entity) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log successful operations
      if (data && data.success !== false) {
        // Extract entity ID from response or request
        let entityId = null;
        if (data.data && data.data.id) {
          entityId = data.data.id;
        } else if (req.params.id) {
          entityId = req.params.id;
        }

        // Prepare log data
        const logData = {
          userId: req.user ? req.user.id : null,
          action,
          entity,
          entityId,
          details: {
            method: req.method,
            url: req.originalUrl,
            body: req.body,
            params: req.params,
            query: req.query
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent')
        };

        // Remove sensitive data from logs
        if (logData.details.body && logData.details.body.password) {
          delete logData.details.body.password;
        }

        // Create log entry asynchronously
        logRepository.create(logData).catch(error => {
          logger.error('Failed to create audit log:', error);
        });
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLogger;
