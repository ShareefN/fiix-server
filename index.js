const express = require("express");
const config = require("config");
const port = process.env.PORT || 3030;

const app = express();

// if (process.env.NODE_ENV === "production") {
//   app.use(function(req, res, next) {
//     var reqType = req.headers["x-forwarded-proto"];
//     reqType == "https"
//       ? next()
//       : res.redirect("https://" + req.headers.host + req.url);
//   });
// }

const server = require("http").createServer(app);

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
