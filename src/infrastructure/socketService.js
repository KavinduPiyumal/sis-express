const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { UserRepository } = require('../repositories');
const logger = require('../config/logger');

const userRepository = new UserRepository();

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: config.socket.corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await userRepository.findById(decoded.userId);

        if (!user || !user.isActive) {
          return next(new Error('Authentication error'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      logger.info(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);
      
      // Join role-based rooms
      socket.join(socket.userRole);
      if (socket.userRole === 'student') {
        socket.join(`student:${socket.userId}`);
      }

      socket.on('disconnect', () => {
        logger.info(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      socket.on('error', (error) => {
        logger.error('Socket error:', error);
      });
    });

    logger.info('Socket.IO service initialized');
  }

  // Send notification to specific user
  sendToUser(userId, event, data) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  // Send notification to all users with specific role
  sendToRole(role, event, data) {
    this.io.to(role).emit(event, data);
  }

  // Send notification to all connected users
  sendToAll(event, data) {
    this.io.emit(event, data);
  }

  // Send notification to specific student
  sendToStudent(studentId, event, data) {
    this.io.to(`student:${studentId}`).emit(event, data);
  }

  // Send new notice notification
  notifyNewNotice(notice) {
    const event = 'new_notice';
    const data = {
      id: notice.id,
      title: notice.title,
      priority: notice.priority,
      createdAt: notice.createdAt
    };

    if (notice.targetAudience === 'all') {
      this.sendToAll(event, data);
    } else {
      this.sendToRole(notice.targetAudience === 'students' ? 'student' : 'admin', event, data);
    }
  }

  // Send result published notification
  notifyResultPublished(result, studentId) {
    const event = 'result_published';
    const data = {
      id: result.id,
      subject: result.subject,
      examType: result.examType,
      marks: result.marks,
      totalMarks: result.totalMarks,
      grade: result.grade
    };

    this.sendToStudent(studentId, event, data);
  }

  // Send payment status notification
  notifyPaymentStatus(payment, studentId) {
    const event = 'payment_status_updated';
    const data = {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      paymentType: payment.paymentType,
      reviewNotes: payment.reviewNotes
    };

    this.sendToStudent(studentId, event, data);
  }

  // Send medical report status notification
  notifyMedicalReportStatus(medicalReport, studentId) {
    const event = 'medical_report_status_updated';
    const data = {
      id: medicalReport.id,
      status: medicalReport.status,
      title: medicalReport.title,
      reviewNotes: medicalReport.reviewNotes
    };

    this.sendToStudent(studentId, event, data);
  }

  // Send general notification
  notifyUser(userId, title, message, type = 'general') {
    const event = 'notification';
    const data = {
      title,
      message,
      type,
      timestamp: new Date()
    };

    this.sendToUser(userId, event, data);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole() {
    const rooms = this.io.sockets.adapter.rooms;
    return {
      students: rooms.get('student')?.size || 0,
      admins: rooms.get('admin')?.size || 0,
      superAdmins: rooms.get('super_admin')?.size || 0
    };
  }
}

module.exports = new SocketService();
