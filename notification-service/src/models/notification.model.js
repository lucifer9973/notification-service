module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('email', 'sms', 'in-app'),
      allowNull: false
    },
    subject: DataTypes.STRING,
    message: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM('queued', 'processing', 'delivered', 'failed'),
      defaultValue: 'queued'
    },
    retryCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  Notification.associate = models => {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };

  return Notification;
};
