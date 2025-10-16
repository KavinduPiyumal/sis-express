
const logger = require('../config/logger');
const { LogRepository } = require('../repositories');
const logRepository = new LogRepository();


const errorHandler = async (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error to file
  logger.error(err);

  // Audit log for failed attempts (if route is API and not health check)
  try {
    if (req && req.originalUrl && req.originalUrl.startsWith('/api')) {
      // Try to extract action/entity from route path
      const pathParts = req.originalUrl.split('/').filter(Boolean);
      const action = req.method;
      const entity = pathParts[2] || pathParts[1] || 'unknown';
      const userId = req.user ? req.user.id : null;
      const logData = {
        userId,
        action,
        entity,
        entityId: req.params && req.params.id ? req.params.id : null,
        module: entity,
        status: 'failure',
        description: error.message || 'Request failed',
        entityType: req.user && req.user.role ? req.user.role : undefined,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          params: req.params,
          query: req.query,
          error: error.message
        },
        ipAddress: req.ip || req.connection?.remoteAddress,
        userAgent: req.get ? req.get('User-Agent') : undefined
      };
      // Remove sensitive data
      if (logData.details.body && logData.details.body.password) {
        delete logData.details.body.password;
      }
      await logRepository.create(logData);
    }
  } catch (logErr) {
    logger.error('Failed to create audit log for error:', logErr);
  }

  // Prisma error handling
  if (err.code && err.code.startsWith('P')) {
    // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
    switch (err.code) {
      case 'P2002': // Unique constraint failed
        return res.status(409).json({
          success: false,
          message: 'Unique constraint error',
          errors: [{ message: err.meta && err.meta.target ? `Duplicate value for: ${err.meta.target.join(', ')}` : 'Unique constraint failed' }]
        });
      case 'P2003': // Foreign key constraint failed
        return res.status(409).json({
          success: false,
          message: 'Foreign key constraint error',
          errors: [{ message: 'Invalid reference to related resource' }]
        });
      case 'P2000': // Value too long for column
        return res.status(400).json({
          success: false,
          message: 'Value too long for column',
          errors: [{ message: err.meta && err.meta.column_name ? `Value too long for column: ${err.meta.column_name}` : 'Value too long for column' }]
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          success: false,
          message: 'Record not found',
          errors: [{ message: err.meta && err.meta.cause ? err.meta.cause : 'Record not found' }]
        });
      // Add more Prisma error codes as needed
      default:
        return res.status(400).json({
          success: false,
          message: 'Database error',
          errors: [{ message: err.message }]
        });
    }
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    errors: [{ message: error.message || 'Internal Server Error' }]
  });
};

module.exports = errorHandler;
