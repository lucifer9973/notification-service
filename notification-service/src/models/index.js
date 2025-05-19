const Sequelize = require('sequelize');
const { sequelize } = require('../config/database');

const User = require('./user.model')(sequelize, Sequelize.DataTypes);
const Notification = require('./notification.model')(sequelize, Sequelize.DataTypes);

// Setup associations
Notification.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Notification
};
