const jwt = require('jsonwebtoken');
const config = require('../config');
const { UserRepository } = require('../repositories');
const prisma = require('../infrastructure/prisma');
const logger = require('../config/logger');

const userRepository = new UserRepository();

const authenticate = async (req, res, next) => {
  try {
    // Accept JWT from HttpOnly cookie or Authorization header
    let token = req.cookies && req.cookies.token;
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }
    // Attach related student id (if any) so downstream controllers can use req.user.studentId
    try {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (student) user.studentId = student.id;
    } catch (err) {
      // ignore lookup errors; user will still be attached
    }
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    // Attach student or lecturer object if applicable
    if (user.role === 'student') {
      const StudentRepository = require('../repositories/StudentRepository');
      const studentRepo = new StudentRepository();
      const student = await studentRepo.findOne({ userId: user.id });
      if (student) user.student = student;
    }
    if (user.role === 'lecturer' || user.role === 'admin') {
      const LecturerRepository = require('../repositories/LecturerRepository');
      const lecturerRepo = new LecturerRepository();
      const lecturer = await lecturerRepo.findOne({ userId: user.id });
      if (lecturer) user.lecturer = lecturer;
    }
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = authenticate;
