require("dotenv").config();
const express = require("express");
const config = require("config");
const port = process.env.PORT || 3030;
const db = require("./models");
var cors = require("cors");
const http = require("http");
const bodyParser = require("body-parser");

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

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  res.header("Content-Type: application/json");
  res.header("Access-Control-Allow-Origin: *");
  next();
});

require("./routes/index")(app);
require("./config/prod")(app);

db.sequelize.sync().then(function() {
  http.createServer(app).listen(port, function() {
    console.log("Listening on port:" + port);
  });
});
