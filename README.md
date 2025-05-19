# Notification Service

A scalable notification service supporting email, SMS, and in-app notifications.

## Features

- REST API endpoints for sending and retrieving notifications
- Asynchronous processing using RabbitMQ
- Retry mechanism with exponential backoff
- Multiple notification providers support
- PostgreSQL database integration

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure values
4. Start services: `docker-compose up -d` (PostgreSQL + RabbitMQ)
5. Run migrations: `npx sequelize-cli db:migrate`
6. Start server: `npm start`
7. Start queue worker: `npm run worker`

## Environment Variables

RABBITMQ_URL=amqp://localhost
DATABASE_URL=postgres://user:pass@localhost:5432/notifications
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token

## API Documentation

### POST /notifications
Send a notification

Body:
{
  "userId": "string",
  "type": "email|sms|in-app",
  "subject": "string",
  "message": "string"
}

### GET /users/{id}/notifications
Get user notifications

Query Params:
- limit: number (default 20)
- offset: number (default 0)

## Assumptions

- Users exist in the system before notifications are sent
- Notification providers are properly configured
- Maximum of 3 retries with exponential backoff
- In-app notifications use WebSocket/Push notifications
- Service runs in UTC timezone
