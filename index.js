const express = require("express");
const config = require('config');
const port = process.env.PORT || 3030;

const app = express();

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

app.listen(port, () => {
  console.log(`Sever connected on port:${port}`);
});
