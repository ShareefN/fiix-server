const jwt = require("jsonwebtoken");
const config = require("config");

authToken = async (req, res, next) => {
  const validateToken = await req.header("Authorization");
  if (!validateToken)
    return res
      .status(404)
      .send({ error: "No token provided"});
      
  try {
    const decoded = await jwt.verify(
      validateToken,
      config.get("jwtPrivateKey")
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send({ error: "Invalid token" });
  }
};

module.exports = authToken;
