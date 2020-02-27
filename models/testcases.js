'use strict';
module.exports = (sequelize, DataTypes) => {
  const TestCases = sequelize.define('TestCases', {
    category: DataTypes.STRING,
    reason: DataTypes.STRING,
    from: DataTypes.STRING,
    to: DataTypes.STRING,
    outcome: DataTypes.STRING
  }, {});
  TestCases.associate = function(models) {
    // associations can be defined here
  };
  return TestCases;
};