const { contractors } = require("../models");
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");

generateAuthToken = user => {
  const token = jwt.sign({ user }, config.get("jwtPrivateKey"));
  return token;
};

login = async (req, res) => {
  const contractor = await contractors.findOne({
    where: { email: req.body.email }
  });

  if (!contractor)
    return res.status(404).send({ message: "Invalid email or password" });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    contractor.password
  );

  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(contractor);
  const result = await _.pick(contractor, [
    "id",
    "name",
    "number",
    "email",
    "location",
    "timeIn",
    "timeOut",
    "profileImage",
    "identity",
    "nonCriminal",
    "rating"
  ]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", result, token });
};

getContractor = async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });

  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  const result = await _.pick(contractor, [
    "id",
    "name",
    "number",
    "email",
    "location",
    "timeIn",
    "timeOut",
    "profileImage",
    "identity",
    "nonCriminal",
    "rating"
  ]);

  res.status(200).send(result);
};

updatePassword = async (req, res) => {
  const contractor = await contractors.findOne({ where: { id: req.params.id } });
  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });
  
  const validatePassword = await bcrypt.compare(
    req.body.password,
    contractor.password
  );
  if (!validatePassword)
    return res.status(400).send({ message: "Invalid password" });
    
  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await contractors
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() =>
      res.status(200).send({ message: "Password successfully updated" })
    )
    .catch(err => res.status(500).send({ error: err.message }));
};

module.exports = {
  login,
  getContractor,
  updatePassword
};
