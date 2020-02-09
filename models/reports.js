'use strict';
module.exports = (sequelize, DataTypes) => {
  const reports = sequelize.define('reports', {
    username: DataTypes.STRING,
    number: DataTypes.STRING,
    report: DataTypes.STRING,
    notes: DataTypes.STRING
  }, {});
  reports.associate = function(models) {
    // associations can be defined here
  };
  return reports;
};