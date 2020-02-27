const users = require('./userController');
const contractors = require("./contractorController");
const application = require('./applicationController');
const admins = require('./adminController');
const report = require('./reportController');
const categories = require('./categoryController');
const review = require('./reviewController');
const forgotPassword = require('./forgotPassword');
const testCases = require('./testCasesController');
// const statistics = require('./statsController');

module.exports = {
  users,
  contractors,
  application,
  admins,
  report,
  categories,
  review,
  forgotPassword,
  testCases,
  // statistics
};
