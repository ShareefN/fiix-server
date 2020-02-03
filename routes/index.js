const logger = require("morgan");

module.exports = app => {
  if (process.env.NODE_ENV === "development") {
    app.use(logger("dev"));
  }

  app.get('/', (req, res) => {
    res.status(200).send({message: 'Server is alive!'})
  })
};
