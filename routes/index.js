const logger = require("morgan");
const bodyParser = require("body-parser");
const {
  users,
  admins,
  application,
  contractors,
  report,
  categories,
  review,
  forgotPassword,
  testCases,
  statistics,
  userApp
} = require("../controllers");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Server is alive!" });
  });

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

  // USER APP ROUTES
  app.use("/app", userApp);

  // ADMIN ROUTES
  app.use("/admins", admins);

  // USER ROUTES
  app.use("/auth", users);

  // APPLICATION ROUTES
  app.use("/application", application);

  // CONTRACTORS ROUTES
  app.use("/auth", contractors);

  // REPORT ROUTES
  app.use("/send", report);

  // CATEGORIES ROUTES
  app.use("/categories", categories);

  // REVIEWS ROUTES
  app.use("/reviews", review);

  // TEST CASES ROUTES
  app.use("/testing", testCases);

  // STATS ROUTES
  app.use("/statistics", statistics);

  // FORGOT PASSWORD
  app.use("/reset", forgotPassword);
};
