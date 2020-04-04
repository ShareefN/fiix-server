const express = require("express");
const config = require("config");
const http = require("http");
const port = process.env.PORT || 3030;

const app = express();

var server = require("http").createServer(app);

// if (process.env.NODE_ENV === "production") {
//   app.use(function(req, res, next) {
//     var reqType = req.headers["x-forwarded-proto"];
//     reqType == "https"
//       ? next()
//       : res.redirect("https://" + req.headers.host + req.url);
//   });
// }

if (process.env.NODE_ENV === "production") {
  http
    .createServer((req, res) => {
      throw new Error("We throw an error before sending a response");
      res.end("ok");
    })
    .listen(port);
}

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

server.listen(port, () => {
  console.log(`Sever connected on port:${port}`);
});
