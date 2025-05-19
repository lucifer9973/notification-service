module.exports = {
  send: async (to, notification) => {
    // Mock email sending for testing without SendGrid
    console.log(`Mock email sent to ${to} with subject: ${notification.subject}`);
    return Promise.resolve();
  }
};
