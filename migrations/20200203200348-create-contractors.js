'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('contractors', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      number: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      location: {
        allowNull: false,
        type: Sequelize.STRING
      },
      timeIn: {
        type: Sequelize.STRING
      },
      timeOut: {
        allowNull: false,
        type: Sequelize.STRING
      },
      profileImage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      identificationImage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isSuperAdmin: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      nonCriminalImage: {
        allowNull: false,
        type: Sequelize.STRING
      },
      isRejected: {
        type: Sequelize.BOOLEAN
      },
      rating: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('contractors');
  }
};