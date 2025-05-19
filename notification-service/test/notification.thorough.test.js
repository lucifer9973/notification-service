require('dotenv').config({ path: './.env' });

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const notificationRoutes = require('../src/routes/notifications');
const userRoutes = require('../src/routes/users');
const { sequelize } = require('../src/config/database');
const NotificationService = require('../src/services/notification.service');

jest.mock('../src/queues/notification.queue', () => ({
  publish: jest.fn(() => Promise.resolve())
}));

const EmailProvider = require('../src/providers/email.provider');
const SMSProvider = require('../src/providers/sms.provider');

// Mock the inapp provider's websocket sendToUser method to prevent errors during tests
jest.mock('../src/websocket', () => ({
  sendToUser: jest.fn()
}));

// Mock EmailProvider.send and SMSProvider.send to prevent real API calls during tests
jest.spyOn(EmailProvider, 'send').mockImplementation(() => Promise.resolve());
jest.spyOn(SMSProvider, 'send').mockImplementation(() => Promise.resolve());

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

describe('Thorough Notification API and Service Tests', () => {
  let userId;
  let notificationId;

  test('Create a user', async () => {
    const User = require('../src/models/user.model')(sequelize, require('sequelize').DataTypes);
    const user = await User.create({ email: 'thoroughtest@example.com', phone: '+1234567890' });
    userId = user.id;
    expect(user).toHaveProperty('id');
  });

  test('Create a notification', async () => {
    const res = await request(app)
      .post('/notifications')
      .send({
        userId,
        type: 'email',
        subject: 'Thorough Test Subject',
        message: 'Thorough test message'
      });

    expect(res.statusCode).toBe(202);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('queued');
    notificationId = res.body.id;
  });

  test('Get user notifications', async () => {
    const res = await request(app)
      .get(`/users/${userId}/notifications`)
      .query({ limit: 10, offset: 0 });

    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe(userId);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(res.body.notifications.length).toBeGreaterThan(0);
  });

  test('Process notification successfully', async () => {
    const notification = {
      id: notificationId,
      userId,
      type: 'email',
      subject: 'Thorough Test Subject',
      message: 'Thorough test message',
      retryCount: 0
    };

    await expect(NotificationService.processNotification(notification)).resolves.not.toThrow();
  });

  test('Process notification with invalid user should throw error', async () => {
    const notification = {
      id: '00000000-0000-0000-0000-000000000000',
      userId: '00000000-0000-0000-0000-000000000000',
      type: 'email',
      subject: 'Invalid User Test',
      message: 'This should fail',
      retryCount: 0
    };

    await expect(NotificationService.processNotification(notification)).rejects.toThrow('User not found');
  });

  test('Handle retry logic for failed notification', async () => {
    const Notification = require('../src/models/notification.model')(sequelize, require('sequelize').DataTypes);
    const notification = await Notification.create({
      userId,
      type: 'email',
      subject: 'Retry Test',
      message: 'Testing retry logic',
      status: 'queued',
      retryCount: 2
    });

    // Simulate failure and retry
    await NotificationService.handleFailure(notification.toJSON(), new Error('Simulated failure'));

    const updatedNotification = await Notification.findByPk(notification.id);
    expect(updatedNotification.status).toBe('failed');
  });
});
