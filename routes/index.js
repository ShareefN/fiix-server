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
  userApp
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
  app.use("/auth", contractors);

  // CATEGORIES ROUTES
  app.use("/categories", categories);

  // REVIEWS ROUTES
  app.use("/reviews", review);

  // STATS ROUTES
  app.use("/statistics", statistics);

  // FORGOT PASSWORD
  app.use("/reset", forgotPassword);
};
