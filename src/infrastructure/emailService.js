const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../config/logger');

class EmailService {

  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (!config.email.host || !config.email.port) {
      logger.warn('Email host or port missing. Email service will not work.');
      return;
    }

    const useAuth = config.email.user && config.email.password;

    const transporterOptions = {
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure === 'true',
    };

    if (useAuth) {
      transporterOptions.auth = {
        user: config.email.user,
        pass: config.email.password,
      };
    }

    this.transporter = nodemailer.createTransport(transporterOptions);

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
      <div style="background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0;">
        <table style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e0e7ef; overflow: hidden;">
          <tr>
            <td style="background: #2d6cdf; padding: 32px 24px; text-align: center;">
              <img src="https://sis.affna.edu.lk/logo.png" alt="SIS Logo" style="height: 48px; margin-bottom: 12px;" />
              <h1 style="color: #fff; font-size: 2rem; margin: 0;">Welcome to SIS!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 1.1rem; color: #333;">Dear <b>${user.firstName} ${user.lastName}</b>,</p>
              <p style="color: #444;">Your account has been created successfully in our Student Information System.</p>
              <div style="background: #f5f8ff; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                <h3 style="color: #2d6cdf; margin-top: 0;">Account Details</h3>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                ${user.studentId ? `<p><strong>Student ID:</strong> ${user.studentId}</p>` : ''}
                ${tempPassword ? `<p><strong>Temporary Password:</strong> <span style="color: #d32f2f;">${tempPassword}</span></p>` : ''}
              </div>
              ${tempPassword ? '<p style="color: #d32f2f;"><b>Please change your password after first login.</b></p>' : ''}
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/login" style="display: inline-block; background: #2d6cdf; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 18px 0;">Login to SIS</a>
              <p style="color: #888; font-size: 0.95rem;">If you have any questions, please contact the system administrator.</p>
              <p style="margin-top: 32px; color: #333;">Best regards,<br><b>SIS Team</b></p>
            </td>
          </tr>
          <tr>
            <td style="background: #f4f6fb; text-align: center; color: #aaa; font-size: 0.9rem; padding: 16px;">&copy; ${new Date().getFullYear()} Student Information System, Affna Campus</td>
          </tr>
        </table>
      </div>
    `;

    logger.info(`Sending welcome email to ${user.email} with temp password: ${tempPassword}`);

    return await this.sendEmail(user.email, subject, html);
  }

  async sendNotificationEmail(user, title, message, type = 'general') {
    const subject = `SIS Notification: ${title}`;
    const html = `
      <div style="background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0;">
        <table style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e0e7ef; overflow: hidden;">
          <tr>
            <td style="background: #2d6cdf; padding: 32px 24px; text-align: center;">
              <img src="https://sis.affna.edu.lk/logo.png" alt="SIS Logo" style="height: 48px; margin-bottom: 12px;" />
              <h1 style="color: #fff; font-size: 2rem; margin: 0;">SIS Notification</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 1.1rem; color: #333;">Dear <b>${user.firstName} ${user.lastName}</b>,</p>
              <div style="background: #f5f8ff; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
                <h3 style="color: #2d6cdf; margin-top: 0;">${title}</h3>
                <p style="color: #444;">${message}</p>
                <p style="color: #888; font-size: 0.95rem;"><small>Type: ${type}</small></p>
              </div>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}" style="display: inline-block; background: #2d6cdf; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 500; margin: 18px 0;">Go to SIS</a>
              <p style="margin-top: 32px; color: #333;">Best regards,<br><b>SIS Team</b></p>
            </td>
          </tr>
          <tr>
            <td style="background: #f4f6fb; text-align: center; color: #aaa; font-size: 0.9rem; padding: 16px;">&copy; ${new Date().getFullYear()} Student Information System, Affna Campus</td>
          </tr>
        </table>
      </div>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async sendPasswordResetEmail(user, resetToken, linkExpiryMinutes) {
    logger.info(`Preparing to send password reset email to ${user.email} with token ${resetToken}`);
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    const html = `
      <div style="background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0;">
        <table style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e0e7ef; overflow: hidden;">
          <tr>
            <td style="background: #2d6cdf; padding: 32px 24px; text-align: center;">
              <img src="https://sis.affna.edu.lk/logo.png" alt="SIS Logo" style="height: 48px; margin-bottom: 12px;" />
              <h1 style="color: #fff; font-size: 2rem; margin: 0;">Password Reset Request</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 1.1rem; color: #333;">Dear <b>${user.firstName} ${user.lastName}</b>,</p>
              <p style="color: #444;">You have requested to reset your password. Click the button below to reset your password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #2d6cdf; color: #fff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-size: 1.1rem; font-weight: 500; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #d32f2f; font-size: 0.98rem;">This link will expire in ${linkExpiryMinutes} minutes. If you didn't request this, please ignore this email.</p>
              <p style="margin-top: 32px; color: #333;">Best regards,<br><b>SIS Team</b></p>
            </td>
          </tr>
          <tr>
            <td style="background: #f4f6fb; text-align: center; color: #aaa; font-size: 0.9rem; padding: 16px;">&copy; ${new Date().getFullYear()} Student Information System, Affna Campus</td>
          </tr>
        </table>
      </div>
    `;
    logger.info(`Sending password reset email to ${user.email} with token ${resetToken} and reset URL ${resetUrl}`);
    logger.info('Email Content:', { subject, html });
    return await this.sendEmail(user.email, subject, html);
  }

    async sendChangePasswordOtpEmail(user, otp) {
    const subject = 'Change Password OTP';
    const html = `
      <div style="background: #f4f6fb; font-family: 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0;">
        <table style="max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px #e0e7ef; overflow: hidden;">
          <tr>
            <td style="background: #2d6cdf; padding: 32px 24px; text-align: center;">
              <img src="https://sis.affna.edu.lk/logo.png" alt="SIS Logo" style="height: 48px; margin-bottom: 12px;" />
              <h1 style="color: #fff; font-size: 2rem; margin: 0;">Change Password OTP</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 24px;">
              <p style="font-size: 1.1rem; color: #333;">Dear <b>${user.firstName} ${user.lastName}</b>,</p>
              <p style="color: #444;">Your OTP for password change is:</p>
              <div style="background: #f5f8ff; border-radius: 8px; padding: 18px 20px; margin: 24px 0; text-align: center;">
                <span style="font-size: 2rem; color: #2d6cdf; font-weight: bold; letter-spacing: 2px;">${otp}</span>
                <p style="color: #d32f2f; margin-top: 12px;">This code will expire in 5 minutes.</p>
              </div>
              <p style="color: #888; font-size: 0.95rem;">If you did not request this, please ignore this email.</p>
              <p style="margin-top: 32px; color: #333;">Best regards,<br><b>SIS Team</b></p>
            </td>
          </tr>
          <tr>
            <td style="background: #f4f6fb; text-align: center; color: #aaa; font-size: 0.9rem; padding: 16px;">&copy; ${new Date().getFullYear()} Student Information System, Affna Campus</td>
          </tr>
        </table>
      </div>
    `;
    return await this.sendEmail(user.email, subject, html);
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }
}

module.exports = new EmailService();
