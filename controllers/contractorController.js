const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const _ = require("lodash");
const { contractors, contractorReviews } = require("../models");
const { Op } = require("sequelize");

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
    return res.status(400).send({
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
    "status",
    "category"
  ]);

  res
    .status(200)
    .header("Authorization", token)
    .send({ message: "success", Contractor, token });
});

router.get("/contractor/:id", [authToken], async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });

  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  const result = await _.pick(contractor, [
    "name",
    "email",
    "number",
    "createdAt",
    "updatedAt",
    "status",
    "notes",
    "bio",
    "location",
    "timeIn",
    "timeOut",
    "profileImage",
    "identity",
    "nonCriminal"
  ]);

  res.status(200).send(result);
});

router.put("/contractor/update/password/:id", [authToken], async (req, res) => {
  if (!req.params.id) return res.status(400).send({ message: "Bad Request" });

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
  if (!req.body.password)
    return res.status(400).send({ message: "Bad request" });

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

  const validatePassword = await bcrypt.compare(
    req.body.password,
    isFound.password
  );
  if (!validatePassword)
    return res.status(400).send({ message: "Password is invalid" });

  if (isFound.dataValues.status !== "active")
    return res
      .status(400)
      .send({ message: `Contractor account ${isFound.dataValues.status}` });

  await contractors
    .update({ status: "deactivated" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.get(
  "/contractor/:contractorId/reviews",
  [authToken],
  async (req, res) => {
    if (!req.params.contractorId)
      return res.status(400).send({ message: "Bad Request" });

    const reviews = await contractorReviews.findAll({
      where: { contractorId: req.params.contractorId },
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["userId", "id", "updatedAt", "contractorId"] }
    });

    res.status(200).send(reviews);
  }
);

router.get("/:category/:contractorId", [authToken], async (req, res) => {
  if (!req.params.category || !req.params.contractorId)
    return res.status(400).send({ message: "Bad Request" });

  const category = await contractors.findAll({
    where: {
      category: req.params.category,
      status: "active",
      [Op.not]: [{ id: req.params.contractorId }]
    },
    attributes: {
      exclude: [
        "password",
        "identity",
        "nonCriminal",
        "notes",
        "updatedAt",
        "email",
        "number",
        "gender",
        "createdAt",
        "status",
        "bio",
        "category",
        "rating"
      ]
    }
  });

  res.status(200).send(category);
});

router.get("/:contractorId", [authToken], async (req, res) => {
  if (!req.params.contractorId)
    return res.status(400).send({ message: "Bad Request" });

  const contractor = await contractors.findOne({
    where: { id: req.params.contractorId },
    attributes: {
      exclude: [
        "password",
        "identity",
        "nonCriminal",
        "notes",
        "updatedAt",
        "email",
        "number",
        "gender",
        "createdAt"
      ]
    }
  });

  if (!contractor) return res.status(400).send({ message: "Not Found" });

  res.status(200).send(contractor);
});

module.exports = router;
