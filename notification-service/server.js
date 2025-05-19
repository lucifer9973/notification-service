require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/config/database');
const notificationRoutes = require('./src/routes/notifications');
const userRoutes = require('./src/routes/users');

const app = express();
app.use(express.json());

// Routes
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('Database connected');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });

module.exports = app; // Export app for testing
