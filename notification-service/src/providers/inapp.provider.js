// Implementation depends on your in-app notification system
module.exports = {
  send: async (userId, notification) => {
    // Example implementation using WebSocket
    const message = {
      type: 'notification',
      data: {
        id: notification.id,
        subject: notification.subject,
        message: notification.message,
        createdAt: new Date().toISOString()
      }
    };
    
    // Broadcast to user's connected clients
    require('../websocket').sendToUser(userId, message);
  }
};
