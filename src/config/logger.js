const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sis-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
});

module.exports = logger;
