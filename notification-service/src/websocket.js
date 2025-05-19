// Mock implementation of websocket module for in-app notifications
module.exports = {
  sendToUser: (userId, message) => {
    // This is a mock function for testing purposes
    console.log(`Mock sendToUser called for user ${userId} with message:`, message);
  }
};
