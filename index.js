const express = require("express");
const config = require('config');
const port = process.env.PORT || 3030;
const http = require('http');

const app = express();
const server = http.createServer(app);

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
require('./config/prod')(app)

server.listen(port, () => {
  console.log(`Sever connected on port:${port}`);
});
