'use strict';
module.exports = (sequelize, DataTypes) => {
  const reminders = sequelize.define('reminders', {
    userId: DataTypes.STRING,
    contractorId: DataTypes.STRING,
    status: DataTypes.STRING,
    item: DataTypes.STRING,
  }, {});
  return reminders;
}