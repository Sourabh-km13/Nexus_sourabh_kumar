'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workers', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      queueName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      version: {
        type: Sequelize.STRING,
        defaultValue: 'v1',
      },
      status: {
        type: Sequelize.ENUM('STARTING', 'RUNNING', 'DEGRADED', 'RESTARTING', 'OUT_OF_SERVICE', 'STOPPED'),
        defaultValue: 'STOPPED',
      },
      pid: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      restartCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastHeartbeat: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastJobAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastError: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workers');
  },
};
