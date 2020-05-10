const users = require('./userController');
const contractors = require("./contractorController");
const application = require('./applicationController');
const admins = require('./adminController');
const categories = require('./categoryController');
const review = require('./reviewController');
const forgotPassword = require('./forgotPassword');
const statistics = require('./statsController');
const userApp = require('./appController');
const postman = require('./postmanController');
const reminders = require('./remindersController');

module.exports = {
  users,
  contractors,
  application,
  admins,
  categories,
  review,
  forgotPassword,
  statistics,
  userApp,
  postman,
  reminders
};
