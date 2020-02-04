const logger = require("morgan");
const bodyParser = require("body-parser");
const { users } = require("../controllers");
const authToken = require('../middleware/authenticate')

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Server is alive!" });
  });

  app.post("/auth/signup", users.signup);

  app.post('/auth/mobile', users.mobileAuth);

  app.post('/auth/login', users.login);

  app.get('/user/:id', authToken, users.getUser);

  app.put('/user/update/:id', authToken, users.updateUser);

  app.put('/user/update/password/:id', authToken, users.updatePassword)
};
