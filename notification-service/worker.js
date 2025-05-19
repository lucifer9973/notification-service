require('dotenv').config();
const { sequelize } = require('./src/config/database');
const NotificationQueue = require('./src/queues/notification.queue');

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await NotificationQueue.connect();
    await NotificationQueue.consume();
    console.log('Worker started');
  } catch (error) {
    console.error('Worker failed to start:', error);
    process.exit(1);
  }
})();
