const logger = require("morgan");
const bodyParser = require("body-parser");
const {
  users,
  admins,
  application,
  contractors,
  report,
  categories,
  review
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
  app.use('/reviews', review);
};
