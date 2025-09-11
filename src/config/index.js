require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'sis_database',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD
  },

  // File Upload Configuration
  upload: {
    driver: process.env.UPLOAD_DRIVER || 'local',
    s3IsPreSigned: process.env.S3_IS_PRE_SIGNED || false,
    path: process.env.UPLOAD_PATH || 'uploads/',
    maxFileSize: process.env.MAX_FILE_SIZE || 5242880, // 5MB
    s3: {
      bucket: process.env.S3_BUCKET,
      region: process.env.S3_REGION,
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY
    },
    baseUrl: process.env.CDN_URL || 'http://localhost:3000'
  },

  // Socket.IO Configuration
  socket: {
    corsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3001'
  },
  
  corsOriginList: process.env.CORS_ORIGIN_LIST ? process.env.CORS_ORIGIN_LIST.split(',') : ['http://localhost:3001', 'http://localhost:5173'],

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
