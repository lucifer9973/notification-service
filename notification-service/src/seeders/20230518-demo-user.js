'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      id: '11111111-1111-1111-1111-111111111111',
      email: 'demo@example.com',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', { email: 'demo@example.com' }, {});
  }
};
