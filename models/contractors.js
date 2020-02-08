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
    category: DataTypes.STRING,
    profileImage: DataTypes.STRING,
    identity: DataTypes.STRING,
    nonCriminal: DataTypes.STRING,
    rating: DataTypes.STRING,
    isLost: DataTypes.STRING,
  }, {});
  contractors.associate = function(models) {
    // associations can be defined here
  };
  return contractors;
};