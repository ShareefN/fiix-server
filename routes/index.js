const logger = require("morgan");
const {
  users,
  admins,
  application,
  contractors,
  categories,
  review,
  forgotPassword,
  statistics,
  userApp,
  postman,
  reminders
} = require("../controllers");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Server is alive!" });
  });

  // USER APP ROUTES
  app.use("/app", userApp);

  // ADMIN ROUTES
  app.use("/admins", admins);

  // USER ROUTES
  app.use("/users", users);

  // APPLICATION ROUTES
  app.use("/application", application);

  // CONTRACTORS ROUTES
  app.use("/contractors", contractors);

  // CATEGORIES ROUTES
  app.use("/categories", categories);

  // REVIEWS ROUTES
  app.use("/reviews", review);

  // STATS ROUTES
  app.use("/statistics", statistics);

  // REMINDERS ROUTES
  app.use('/reminders', reminders);

  // FORGOT PASSWORD
  app.use("/reset", forgotPassword);
  
  // POSTMAN ROUTES
  app.use("/postman", postman);
};
