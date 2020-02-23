const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const _ = require("lodash");
const { contractors, users } = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"));
  return token;
};

router.post("/user/mobile", async (req, res) => {
  const isFound = await users.findOne({ where: { number: req.body.number } });

  if (!isFound)
    return res.status(404).send({ error: "mobile number not found" });

  if (isFound.status !== "active")
    return res.status(403).send({
      message: `User account ${isFound.dataValue.status}`,
      notes: isFound.notes
    });

  res.status(200).send({ message: "mobile number found" });

  // handle sms otp verification for found or not found cases

  // if found and verified, generate token and send to dashboard

  // if not found and verified, send to signup...
});

router.post("/user/register", async (req, res) => {
  const isFound = await users.findOne({ where: { email: req.body.email } });
  if (isFound) return res.status(409).send({ message: "User already exists" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email }
  });
  if (isContractor)
    return res.status(409).send({ message: "Contractor already exists" });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await users
    .create(req.body)
    .then(async user => {
      const token = await generateAuthToken(user);
      const User = await _.pick(user, [
        "id",
        "username",
        "email",
        "number",
        "status"
      ]);

      res
        .status(201)
        .header("x-auth-token", token)
        .send({ message: "success", User, token });
    })
    .catch(error => {
      res.status(500).send({ error: error.message });
    });
});

router.post("/user/login", async (req, res) => {
  const user = await users.findOne({ where: { email: req.body.email } });
  if (!user)
    return res.status(404).send({ message: "Invalid email or password" });

  if (user.status !== "active")
    return res.status(403).send({ message: `User account is ${user.status}` });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(user);
  const User = await _.pick(user, [
    "id",
    "username",
    "email",
    "number",
    "status"
  ]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", User, token });
});

router.get("/user/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const result = await _.pick(user, [
    "id",
    "username",
    "email",
    "number",
    "status",
    "notes",
    "createdAt",
    "updatedAt"
  ]);
  res.status(200).send(result);
});

router.put("/update/user/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ error: "User not found" });

  await users.update(req.body, { where: { id: req.params.id } });

  res.status(200).send({ message: "User successfully updated" });
});

router.put("/update/user/password/:id", [authToken], async (req, res) => {
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

  await users
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() =>
      res.status(200).send({ message: "Password successfully updated" })
    )
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/deactivate/user/:id", [authToken], async (req, res) => {
  const isFound = await users.findOne({ where: { id: req.params.id } });
  if (!isFound) return res.status(404).send({ message: "User not found" });

  if (isFound.status !== "active")
    return res
      .status(400)
      .send({ message: `User account already ${isFound.status}` });

  await users
    .update({ status: "deactivated" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/forgot/password", async (req, res) => {
  const user = await users.findOne({ where: { email: req.body.email } });
  if(!user) return res.status(404).send({message: 'Not found'})

  // send email to user with input to enter new password
});

module.exports = router;
