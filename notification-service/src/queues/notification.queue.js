const amqp = require('amqplib');
const NotificationService = require('../services/notification.service');

class NotificationQueue {
  constructor() {
    this.channel = null;
    this.queueName = 'notifications';
    this.retryExchange = 'retry_exchange';
  }

  async connect() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URL);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(this.queueName, { durable: true });
    await this.channel.assertExchange(this.retryExchange, 'direct', { durable: true });

    // Dead letter queue for retries
    await this.channel.assertQueue(`${this.queueName}_retry`, {
      durable: true,
      deadLetterExchange: this.retryExchange,
      deadLetterRoutingKey: this.queueName
    });
  }

  async publish(notification) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(notification)),
      { persistent: true }
    );
  }

  async consume() {
    this.channel.consume(this.queueName, async (msg) => {
      const notification = JSON.parse(msg.content.toString());

      try {
        await NotificationService.processNotification(notification);
        this.channel.ack(msg);
      } catch (error) {
        console.error(`Notification failed: ${error.message}`);
        await this.handleRetry(notification, msg);
      }
    });
  }

  async handleRetry(notification, msg) {
    if (notification.retryCount < 3) {
      const delay = Math.pow(2, notification.retryCount) * 1000;

      this.channel.publish(
        this.retryExchange,
        `${this.queueName}_retry`,
        Buffer.from(JSON.stringify(notification)),
        { headers: { 'x-delay': delay } }
      );
    }
    this.channel.ack(msg);
  }
}

module.exports = new NotificationQueue();
