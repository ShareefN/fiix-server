require("dotenv").config();
const express = require("express");
const config = require("config");
const port = process.env.PORT || 3030;
const db = require("./models");
var cors = require("cors");

const app = express();
app.use(cors());

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
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

require("./routes/index")(app);
require("./config/prod")(app);

db.sequelize.sync({}).then(function() {
  app.listen(port, function() {
    console.log("Listening on localhost:" + port);
  });
});
