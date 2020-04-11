"use strict";
module.exports = (sequelize, DataTypes) => {
  const application = sequelize.define(
    "application",
    {
      userId: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      number: DataTypes.STRING,
      password: DataTypes.STRING,
      location: DataTypes.STRING,
      timeIn: DataTypes.STRING,
      timeOut: DataTypes.STRING,
      category: DataTypes.STRING,
      subCategory: DataTypes.STRING,
      profileImage: DataTypes.STRING,
      identity: DataTypes.STRING,
      nonCriminal: DataTypes.STRING
    },
    {}
  );
  application.associate = function(models) {
    // associations can be defined here
  };
  return application;
};
