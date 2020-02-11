'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    number: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING,
    applicationStatus: DataTypes.STRING,
    notes: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};