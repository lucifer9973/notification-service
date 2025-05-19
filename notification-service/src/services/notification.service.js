const { Notification, User } = require('../models');
const NotificationQueue = require('../queues/notification.queue');
const EmailProvider = require('../providers/email.provider');
const SMSProvider = require('../providers/sms.provider');
const InAppProvider = require('../providers/inapp.provider');

module.exports = class NotificationService {
  static async createNotification(data) {
    if (!data.userId) {
      throw new Error('userId is required');
    }
    if (!data.type || !['email', 'sms', 'in-app'].includes(data.type)) {
      throw new Error('Invalid notification type');
    }
    const notification = await Notification.create(data);
    await NotificationQueue.publish(notification.toJSON());
    return notification;
  }

  static async processNotification(notification) {
    if (!notification.id) {
      throw new Error('Notification id is required');
    }
    if (!notification.userId) {
      throw new Error('Notification userId is required');
    }
    try {
      await Notification.update(
        { status: 'processing' },
        { where: { id: notification.id } }
      );
      
      const user = await User.findByPk(notification.userId);
      if (!user) throw new Error('User not found');

      switch (notification.type) {
        case 'email':
          await EmailProvider.send(user.email, notification);
          break;
        case 'sms':
          await SMSProvider.send(user.phone, notification);
          break;
        case 'in-app':
          await InAppProvider.send(user.id, notification);
          break;
      }

      await Notification.update(
        { status: 'delivered' },
        { where: { id: notification.id } }
      );
    } catch (error) {
      await this.handleFailure(notification, error);
      throw error;
    }
  }

  static async getUserNotifications(userId, limit, offset) {
    return Notification.findAll({
      where: { userId },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
  }

  static async handleFailure(notification, error) {
    const retryCount = notification.retryCount + 1;
    
    if (retryCount >= 3) {
      await Notification.update(
        { status: 'failed' },
        { where: { id: notification.id } }
      );
    } else {
      await Notification.update(
        { status: 'queued', retryCount },
        { where: { id: notification.id } }
      );
      await NotificationQueue.publish({
        ...notification,
        retryCount
      });
    }
  }
};
