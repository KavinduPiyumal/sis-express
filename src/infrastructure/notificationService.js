const prisma = require('./prisma');
const logger = require('../config/logger');

const emailService = require('./emailService');

class NotificationService {
  /**
   * Create a notification for a user
   * @param {Object} opts
   * @param {string} opts.userId - User ID to notify
   * @param {string} opts.title - Notification title
   * @param {string} opts.message - Notification message (HTML or plain)
   * @param {string} [opts.type] - Notification type (e.g., 'enrollment')
   * @param {string} [opts.relatedEntityId] - Optional related entity ID
   * @param {string} [opts.relatedEntityType] - Optional related entity type
   * @returns {Promise<Object>} The created notification
   */
  async createNotification({ userId, title, message, type = 'general', relatedEntityId = null, relatedEntityType = null }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          relatedEntityId,
          relatedEntityType,
        },
      });
      logger.info(`Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (err) {
      logger.error('Failed to create notification', { error: err.message, userId, title });
      return null;
    }
  }

  /**
   * Create a notification and optionally send an email
   * @param {Object} opts
   * @param {Object} opts.user - User object (must have at least .id and .email if email is needed)
   * @param {string} opts.title - Notification title
   * @param {string} opts.message - Notification message (HTML or plain)
   * @param {string} [opts.type] - Notification type (e.g., 'enrollment')
   * @param {string} [opts.relatedEntityId] - Optional related entity ID
   * @param {string} [opts.relatedEntityType] - Optional related entity type
   * @param {boolean} [opts.isNotifyEmail] - If true, send email as well
   * @param {string} [opts.emailType] - Optional email type for template
   * @returns {Promise<Object>} The created notification
   */
  async notifyUser({ user, title, message, type = 'general', relatedEntityId = null, relatedEntityType = null, isNotifyEmail = false, emailType = null }) {
    // Always create notification
    const notification = await this.createNotification({
      userId: user.id,
      title,
      message,
      type,
      relatedEntityId,
      relatedEntityType
    });
    // Optionally send email
    if (isNotifyEmail && user.email) {
      try {
        const sent = await emailService.sendNotificationEmail(user, title, message, emailType || type);
        if (!sent) {
          logger.warn(`Failed to send notification email to user: ${user.email}`);
        }
      } catch (err) {
        logger.warn('Error sending notification email', { error: err.message, user: user.email });
      }
    }
    return notification;
  }
}

module.exports = new NotificationService();
