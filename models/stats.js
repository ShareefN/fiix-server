'use strict';
module.exports = (sequelize, DataTypes) => {
  const stats = sequelize.define('stats', {
    users: DataTypes.STRING,
    contractors: DataTypes.STRING,
    categories: DataTypes.STRING,
    applications: DataTypes.STRING,
    feedbacks: DataTypes.STRING,
    testCases: DataTypes.STRING,
    admins: DataTypes.STRING,
    reviews: DataTypes.STRING,
    prohibited: DataTypes.STRING
  }, {});
  stats.associate = function(models) {
    // associations can be defined here
  };
  return stats;
};