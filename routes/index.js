const logger = require("morgan");
const bodyParser = require("body-parser");
const { users, application, contractors, admin } = require("../controllers");
const authToken = require("../middleware/authenticate");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Server is alive!" });
  });

  // USER ROUTES
  app.post("/auth/signup", users.signup);

  app.post("/auth/mobile", users.mobileAuth);

  app.post("/auth/login", users.login);

  app.get("/user/:id", authToken, users.getUser);

  app.put("/user/update/:id", authToken, users.updateUser);

  app.put("/user/update/password/:id", authToken, users.updatePassword);

  // APPLICATION ROUTES
  app.post(
    "/api/contractor/register/:id",
    authToken,
    application.applicationFunnel
  );

  app.post("/api/approve/:id", authToken, application.approveApplication);

  app.post("/api/reject/:id", authToken, application.rejectApplication);

  app.get("/applications", authToken, application.getApplications);

  // CONTRACTOR ROUTES
  app.post("/auth/contractor/login", contractors.login);

  app.get("/api/contractor/:id", authToken, contractors.getContractor);

  app.put(
    "/contractor/update/password/:id",
    authToken,
    contractors.updatePassword
  );

  // ADMIN ROUTES
  app.get("/api/contractors", authToken, admin.getContractors);

  app.get("/users", authToken, admin.getUsers);

  app.put("/api/block/:id", authToken, admin.blockUser);

  app.put("/api/unblock/:id", authToken, admin.unBlockUser);
};
