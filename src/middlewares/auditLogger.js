const { LogRepository } = require('../repositories');
const logger = require('../config/logger');

const logRepository = new LogRepository();

const auditLogger = (action, entity, options = {}) => {
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

        // Extract userId: prefer req.user, fallback to data.data.id for login
        let userId = req.user ? req.user.id : null;
        if (!userId && action === 'login' && data.data && data.data.id) {
          userId = data.data.id;
        }

        // Extract module, status, description, entityType from options or infer
        const moduleName = options.module || 'auth'; // default to 'auth', can be overridden
        const status = (typeof options.status !== 'undefined') ? options.status : (data.success === true ? 'success' : 'failure');
        const description = options.description || data.message || `${action} ${entity} ${status}`;
        let entityType = options.entityType;
        if (!entityType && data.data && data.data.role) {
          entityType = data.data.role;
        } else if (!entityType && req.user && req.user.role) {
          entityType = req.user.role;
        }

        // Prepare log data
        const logData = {
          userId,
          action,
          entity,
          entityId,
          module: moduleName,
          status,
          description,
          entityType,
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
