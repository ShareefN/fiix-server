require("dotenv").config();
const express = require("express");
const config = require("config");
const port = process.env.PORT || 3030;
const db = require("./models");

const app = express();

process.on("uncaughtException", err => {
  console.log(err.message);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  throw new Error("Expected promise to be rejected", err);
});

if (!config.get("jwtPrivateKey")) {
  throw new Error("Error: jwtPrivateKey is not defined.");
}

app.use(function(req, res, next) {
  header("Access-Control-Allow-Origin: *");
  header(
    "Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  header("Access-Control-Allow-Headers: Origin, Content-Type, Authorization");
  next();
});

require("./routes/index")(app);
require("./config/prod")(app);

db.sequelize.sync({}).then(function() {
  app.listen(port, function() {
    console.log("Listening on localhost:" + port);
  });
});
