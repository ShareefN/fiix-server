'use strict';
module.exports = (sequelize, DataTypes) => {
  const admins = sequelize.define('admins', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    isSuperAdmin: DataTypes.STRING,
    isDeactivated: DataTypes.STRING
  }, {});
  admins.associate = function(models) {
    // associations can be defined here
  };
  return admins;
};