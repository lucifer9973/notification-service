jest.mock('../src/queues/notification.queue');
const { execSync } = require('child_process');
require('dotenv').config({ path: './.env' });

const { sequelize } = require('../src/config/database');

module.exports = async () => {
  try {
    await sequelize.authenticate();
    // Run migrations before tests
    execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
    // Run seeders if needed
    execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
    console.log('Database connected, migrated, and seeded successfully.');
  } catch (error) {
    console.error('Unable to connect to the database or run migrations:', error);
    process.exit(1);
  }
};
