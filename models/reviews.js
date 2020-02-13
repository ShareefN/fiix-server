'use strict';
module.exports = (sequelize, DataTypes) => {
  const reviews = sequelize.define('reviews', {
    userId: DataTypes.INTEGER,
    username: DataTypes.STRING,
    number: DataTypes.STRING,
    review: DataTypes.STRING,
    likes: DataTypes.STRING,
    userIds: DataTypes.STRING
  }, {});
  reviews.associate = function(models) {
    // associations can be defined here
  };
  return reviews;
};