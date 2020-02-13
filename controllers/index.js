const users = require('./userController');
const contractors = require("./contractorController");
const application = require('./applicationController');
const admins = require('./adminController');
const report = require('./reportController');
const categories = require('./categoryController');

module.exports = {
  users,
  contractors,
  application,
  admins,
  report,
  categories
};
