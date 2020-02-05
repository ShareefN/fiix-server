const users = require("./usersController");
const contractors = require("./contractorsController");
const application = require('./applicationController');
const admin = require('./adminControllers')

module.exports = {
  users,
  contractors,
  application,
  admin
};
