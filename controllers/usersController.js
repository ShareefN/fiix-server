const { users } = require("../models");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const config = require("config");
const bcrypt = require("bcrypt");

validateInput = user => {
  const schema = {
    username: Joi.string()
      .min(3)
      .max(100),
    email: Joi.string()
      .min(5)
      .max(100)
      .email(),
    number: Joi.string()
      .min(8)
      .max(11),
    password: Joi.string()
      .min(6)
      .max(1024)
  };
  return Joi.validate(user, schema);
};

generateAuthToken = user => {
  const token = jwt.sign({ user }, config.get("jwtPrivateKey"));
  return token;
};

mobileAuth = async (req, res) => {
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send({ error: error.message });

  const isFound = await users.findOne({ where: { number: req.body.number } });
  if (!isFound)
    return res.status(404).send({ error: "mobile number not found" });

  res.status(200).send({ message: "mobile number found" });

  // handle sms otp verification if found or not found

  // if found and verified, send to generate token and send to dashboard

  // if not found and verified, send to signup...
};

signup = async (req, res) => {
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send({ error: error.message });

  const isFound = await users.findOne({ where: { email: req.body.email } });
  if (isFound) return res.status(409).send({ message: "User already exists" });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await users
    .create(req.body)
    .then(async user => {
      const token = await generateAuthToken(user);
      const result = await _.pick(user, ["username", "email", "number"]);

      res
        .status(201)
        .header("x-auth-token", token)
        .send({ message: "success", result, token });
    })
    .catch(error => {
      res.status(500).send({ error: error.message });
    });
};

login = async (req, res) => {
  const { error } = validateInput(req.body);
  if (error) return res.status(400).send({ error: error.message });

  const user = await users.findOne({ where: { email: req.body.email } });
  if (!user)
    return res.status(404).send({ message: "Invalid email or password" });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(user);
  const result = await _.pick(user, ["username", "email", "number"]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", result, token });
};

getUser = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const result = await _.pick(user, ["username", "email", "number"]);
  res.status(200).send(result);
};

updateUser = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ error: "User not found" });

  await users.update(
    {
      username: req.body.username === null ? user.username : req.body.username,
      email: req.body.email === null ? user.email : req.body.email
    },
    { where: { id: req.params.id } }
  );

  res.status(200).send({ message: "User successfully updated" });
};

updatePassword = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(400).send({ message: "Password is invalid" });

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await users.update(
    { password: req.body.newPassword },
    { where: { id: req.params.id } }
  );

  res.status(200).send({ message: "Password successfully updated" });
};

resetPassword = async (req, res) => {
  // send email to user with input to enter new password
};

deleteUser = async (rq, res) => {
  // deactive user account and delete from database
}

module.exports = {
  signup,
  mobileAuth,
  login,
  getUser,
  updateUser,
  updatePassword
};
