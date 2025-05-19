const NotificationService = require('../services/notification.service');

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, subject, message } = req.body;
    const notification = await NotificationService.createNotification({
      userId,
      type,
      subject,
      message
    });
    
    res.status(202).json({
      id: notification.id,
      status: notification.status,
      createdAt: notification.createdAt
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
