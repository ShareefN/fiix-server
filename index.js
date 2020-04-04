require("dotenv").config();
const express = require("express");
const config = require("config");
const port = process.env.PORT || 3030;
const db = require("./models");

const app = express();

const server = require("http").createServer(app);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log("check error ===> ", err);
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
  console.log(err);
});

process.on("uncaughtException", err => {
  console.log(err.message);
  process.exit(1);
});

process.on("unhandledRejection", err => {
  throw new Error("Expected promise to be rejected");
});

if (!config.get("jwtPrivateKey")) {
  throw new Error("Error: jwtPrivateKey is not defined.");
}

require("./routes/index")(app);
require("./config/prod")(app);

db.sequelize.sync({}).then(function() {
  app.listen(port, function() {
    console.log("Listening on localhost:" + port);
  });
});
