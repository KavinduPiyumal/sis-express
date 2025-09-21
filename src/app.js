// ...existing code...
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import configuration and services
const config = require('./config');
const logger = require('./config/logger');
const { connectDB } = require('./infrastructure/database');
const socketService = require('./infrastructure/socketService');
const errorHandler = require('./middlewares/errorHandler');


// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const degreeProgramRoutes = require('./routes/degreeProgramRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classSectionRoutes = require('./routes/classSectionRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const semesterGPARoutes = require('./routes/semesterGPARoutes');
const cgpaRoutes = require('./routes/cgpaRoutes');
const gradingSystemRoutes = require('./routes/gradingSystemRoutes');
const degreeRuleRoutes = require('./routes/degreeRuleRoutes');
const transcriptRoutes = require('./routes/transcriptRoutes');
const medicalReportRoutes = require('./routes/medicalReportRoutes');
const departmentsRoutes = require('./routes/departmentRoutes');
const batchRoutes = require('./routes/batchRoutes');

// Import models to initialize associations
require('./entities');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
socketService.initialize(server);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOriginList,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser for JWT HttpOnly cookies
app.use(cookieParser());

// Static file serving for uploads with dynamic CORS headers for images
app.use('/uploads', (req, res, next) => {
  const allowedOrigins = config.corsOriginList;
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/degree-programs', degreeProgramRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/class-sections', classSectionRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/semester-gpas', semesterGPARoutes);
app.use('/api/cgpas', cgpaRoutes);
app.use('/api/grading-systems', gradingSystemRoutes);
app.use('/api/degree-rules', degreeRuleRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/medical-reports', medicalReportRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/logs', require('./routes/logRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SIS Backend API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Sync database (create tables if they don't exist)
    if (config.nodeEnv === 'development') {
      const { sequelize } = require('./infrastructure/database');
      await sequelize.sync({ alter: true });
      logger.info('Database synchronized');
    }

    // Start server
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`Health check available at http://localhost:${config.port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;
