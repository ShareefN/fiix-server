const express = require("express");
const port = process.env.PORT || 3030;

const app = express();

require('./routes/index')(app)

app.listen(port, () => {
  console.log(`Sever connected on port:${port}`)
})