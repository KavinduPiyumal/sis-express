const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    error.message = messages.join(', ');
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: messages
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    error.message = `${field} already exists`;
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Sequelize foreign key constraint error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'Invalid reference to related resource';
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'File size too large';
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Invalid file field';
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  // Default error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
};

module.exports = errorHandler;
