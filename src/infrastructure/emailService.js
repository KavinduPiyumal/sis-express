const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!config.email.user || !config.email.password) {
      logger.warn('Email configuration not complete. Email service will not work.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    try {
      const mailOptions = {
        from: config.email.user,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(user, tempPassword = null) {
    const subject = 'Welcome to Student Information System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to SIS!</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>Your account has been created successfully in our Student Information System.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Account Details:</h3>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          ${user.studentId ? `<p><strong>Student ID:</strong> ${user.studentId}</p>` : ''}
          ${tempPassword ? `<p><strong>Temporary Password:</strong> ${tempPassword}</p>` : ''}
        </div>
        ${tempPassword ? '<p><strong>Please change your password after first login.</strong></p>' : ''}
        <p>If you have any questions, please contact the system administrator.</p>
        <p>Best regards,<br>SIS Team</p>
      </div>
    `;

    logger.info(`Sending welcome email to ${user.email} with temp password: ${tempPassword}`);

    return await this.sendEmail(user.email, subject, html);
  }

  async sendNotificationEmail(user, title, message, type = 'general') {
    const subject = `SIS Notification: ${title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Notification</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${title}</h3>
          <p>${message}</p>
          <p><small>Type: ${type}</small></p>
        </div>
        <p>Please log in to your account to view more details.</p>
        <p>Best regards,<br>SIS Team</p>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(user, resetToken) {
    logger.info(`Preparing to send password reset email to ${user.email} with token ${resetToken}`);
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Dear ${user.firstName} ${user.lastName},</p>
        <p>You have requested to reset your password. Click the link below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>SIS Team</p>
      </div>
    `;
    logger.info(`Sending password reset email to ${user.email} with token ${resetToken} and reset URL ${resetUrl}`);
    logger.info('Email Content:', { subject, html });
    return await this.sendEmail(user.email, subject, html);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
