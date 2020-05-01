"use strict";
module.exports = (sequelize, DataTypes) => {
  const contractorReviews = sequelize.define(
    "contractorReviews",
    {
      contractorId: DataTypes.STRING,
      userId: DataTypes.STRING,
      username: DataTypes.STRING,
      review: DataTypes.STRING
    },
    {}
  );
  contractorReviews.associate = function(models) {
    // associations can be defined here
  };
  return contractorReviews;
};
