const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const _ = require("lodash");
const { contractors } = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"));
  return token;
};

router.post("/contractor/login", async (req, res) => {
  const contractor = await contractors.findOne({
    where: { email: req.body.email }
  });

  if (!contractor)
    return res.status(404).send({ message: "Invalid email or password" });

  if (contractor.dataValues.status !== "active")
    return res
      .status(400)
      .send({
        message: `Contractor account ${contractor.dataValues.status}`,
        notes: contractor.dataValues.notes
      });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    contractor.password
  );

  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(contractor);
  const Contractor = await _.pick(contractor, [
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
    "rating",
    "status"
  ]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", nextStep: "dashboard", Contractor, token });
});

router.get("/contractor/:id", [authToken], async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });

  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  const result = await _.pick(contractor, [
    "id",
    "name",
    "email",
    "number",
    "hasApplied",
    "isRejected",
    "isProhibited",
    "isDeactivated",
    "rejectedReason",
    "prohibitedReason",
    "createdAt",
    "updatedAt",
    "status",
    "notes"
  ]);

  res.status(200).send(result);
});

router.put("/contractor/update/password/:id", [authToken], async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });

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
});

router.put("/update/contractor/:id", [authToken], async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });

  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  await contractors
    .update(req.body, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/deactivate/contractor/:id", [authToken], async (req, res) => {
  const isFound = await contractors.findOne({ where: { id: req.params.id } });
  if (!isFound)
    return res.status(404).send({ message: "contractor not found" });

  if (isFound.dataValues.status !== "active")
    return res
      .status(400)
      .send({ message: `Contractor account ${isFound.dataValues.status}` });

  await contractors
    .update({ status: "deactivated" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

module.exports = router;
