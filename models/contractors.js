'use strict';
module.exports = (sequelize, DataTypes) => {
  const contractors = sequelize.define('contractors', {
    name: DataTypes.STRING,
    number: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    location: DataTypes.STRING,
    timeIn: DataTypes.STRING,
    timeOut: DataTypes.STRING,
    profileImage: DataTypes.STRING,
    identificationImage: DataTypes.STRING,
    isSuperAdmin: DataTypes.BOOLEAN,
    nonCriminalImage: DataTypes.STRING,
    isRejected: DataTypes.BOOLEAN,
    rating: DataTypes.STRING
  }, {});
  contractors.associate = function(models) {
    // associations can be defined here
  };
  return contractors;
};