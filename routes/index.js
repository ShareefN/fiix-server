const logger = require("morgan");
const bodyParser = require("body-parser");
const { users } = require("../controllers");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.get("/", (req, res) => {
    res.status(200).send({ message: "Server is alive!" });
  });

  app.post("/api/register/user", users.registerUser);
};
