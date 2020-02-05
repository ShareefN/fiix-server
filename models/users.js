'use strict';
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    number: DataTypes.STRING,
    password: DataTypes.STRING,
    hasApplied: DataTypes.STRING,
    isRejected: DataTypes.STRING,
    isProhibited: DataTypes.STRING,
    rejectedReason: DataTypes.STRING,
    prohibitedReason: DataTypes.STRING
  }, {});
  users.associate = function(models) {
    // associations can be defined here
  };
  return users;
};