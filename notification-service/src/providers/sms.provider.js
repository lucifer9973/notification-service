const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

module.exports = {
  send: async (to, notification) => {
    await client.messages.create({
      body: `${notification.subject}\n${notification.message}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
  }
};
