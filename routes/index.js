const logger = require("morgan");
const bodyParser = require("body-parser");
const { users, application, contractors, admin } = require("../controllers");
const authToken = require("../middleware/authenticate");
const superAdmin = require("../middleware/superAdmin");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });

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

  app.put('/user/deactivate/:id', authToken, users.deactivateAccount)

  // APPLICATION ROUTES
  app.post(
    "/api/contractor/register/:id",
    authToken,
    application.applicationFunnel
  );

  // CONTRACTOR ROUTES
  app.post("/auth/contractor/login", contractors.login);

  app.get("/api/contractor/:id", authToken, contractors.getContractor);

  app.put(
    "/contractor/update/password/:id",
    authToken,
    contractors.updatePassword
  );

  app.put("/contractor/update/:id", authToken, contractors.updateContractor);

  // ADMIN ROUTES
  app.get("/api/contractors", authToken, admin.getContractors);

  app.get("/users", authToken, admin.getUsers);

  app.put("/api/block/:id", [authToken, superAdmin], admin.blockUser);

  app.put("/api/unblock/:id", [authToken, superAdmin], admin.unBlockUser);

  app.put(
    "/api/contractor/deactivate/:id",
    [authToken, superAdmin],
    admin.deactivateContractor
  );

  app.put(
    "/api/contractor/activate/:id",
    [authToken, superAdmin],
    admin.activateContractor
  );

  app.post("/api/create/admin", [authToken, superAdmin], admin.createAdmin);

  app.post("/api/login/admin", admin.login);

  app.put(
    "/api/update/password/admin/:id",
    authToken,
    admin.updateAdminPassword
  );

  app.put(
    "/api/deactivate/admin/:id",
    [authToken, superAdmin],
    admin.deactivateAdmin
  );

  app.put('/api/activate/user/:id', authToken, admin.activateUser)

  app.post("/api/approve/:id", authToken, admin.approveApplication)

  app.post("/api/reject/:id", authToken, admin.rejectApplication);

  app.get("/applications", authToken, admin.getApplications);
};
