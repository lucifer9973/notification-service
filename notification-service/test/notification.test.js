require('dotenv').config({ path: './.env' }); // Load environment variables for tests

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const notificationRoutes = require('../src/routes/notifications');
const userRoutes = require('../src/routes/users');
const { sequelize } = require('../src/config/database');
const NotificationService = require('../src/services/notification.service');

const app = express();
app.use(bodyParser.json());
app.use('/notifications', notificationRoutes);
app.use('/users', userRoutes);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Notification API', () => {
  let userId;

  test('Create a notification', async () => {
    // Create a user first
    const User = require('../src/models/user.model')(sequelize, require('sequelize').DataTypes);
    const user = await User.create({ email: 'test@example.com', phone: '+1234567890' });
    userId = user.id;

    const res = await request(app)
      .post('/notifications')
      .send({
        userId,
        type: 'email',
        subject: 'Test Subject',
        message: 'Test message'
      });

    expect(res.statusCode).toBe(202);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('queued');
  });

  test('Get user notifications', async () => {
    const res = await request(app)
      .get(`/users/${userId}/notifications`)
      .query({ limit: 10, offset: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });
});

describe('Notification Service', () => {
  test('Process notification with invalid user should throw error', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      type: 'email',
      subject: 'Test',
      message: 'Test message',
      retryCount: 0
    };

    await expect(NotificationService.processNotification(notification)).rejects.toThrow('User not found');
  });
});
