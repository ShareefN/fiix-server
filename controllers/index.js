const users = require('./userController');
const contractors = require("./contractorController");
const application = require('./applicationController');
const admins = require('./adminController');
const review = require('./reviewController');
const forgotPassword = require('./forgotPassword');
const statistics = require('./statsController');
const postman = require('./postmanController');
const reminders = require('./remindersController');

module.exports = {
  users,
  contractors,
  application,
  admins,
  review,
  forgotPassword,
  statistics,
  postman,
  reminders
};
