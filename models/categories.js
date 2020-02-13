'use strict';
module.exports = (sequelize, DataTypes) => {
  const categories = sequelize.define('categories', {
    category: DataTypes.STRING,
    subCategory: DataTypes.STRING,
    status: DataTypes.STRING,
    notes: DataTypes.STRING
  }, {});
  categories.associate = function(models) {
    // associations can be defined here
  };
  return categories;
};