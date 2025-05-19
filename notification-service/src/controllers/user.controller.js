const NotificationService = require('../services/notification.service');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getUserNotifications(
      req.params.id,
      req.query.limit || 20,
      req.query.offset || 0
    );
    
    res.json({
      userId: req.params.id,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
