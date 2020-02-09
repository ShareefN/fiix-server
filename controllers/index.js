const users = require('./userController');
const contractors = require("./contractorController");
const application = require('./applicationController');
const admins = require('./adminController')

module.exports = {
  users,
  contractors,
  application,
  admins
};
