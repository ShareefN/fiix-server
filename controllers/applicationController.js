const express = require("express");
const router = express.Router();
const _ = require("lodash");
const { contractors, users, application } = require("../models");

router.post("/apply/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "Not found" });

  if (user.status.toLowerCase() !== "active")
    return res.status(403).send({
      message: `User account already ${user.status}`,
      status: user.status,
      notes: user.notes
    });

  if (user.applicationStatus !== null)
    return res.status(403).send({
      message: `User already ${user.applicationStatus}`,
      status: user.status,
      notes: user.notes
    });

  const isFoundContractor = await contractors.findOne({
    where: { name: `${req.body.firstName} ${req.body.lastName}` }
  });

  if (isFoundContractor)
    return res.status(302).send({
      message: "Contractor already exsist"
    });

  const contractor = {
    userId: user.id,
    name: `${req.body.firstName} ${req.body.lastName}`,
    email: user.email,
    number: user.number,
    gender: user.gender,
    password: user.password,
    location: req.body.location,
    timeIn: req.body.timeIn,
    timeOut: req.body.timeOut,
    category: req.body.category,
    subCategory: null,
    profileImage: req.body.profileImage,
    identity: req.body.identity,
    nonCriminal: req.body.nonCriminal
  };

  await application
    .create(contractor)
    .then(async response => {
      await users
        .update(
          { applicationStatus: "applied" },
          { where: { id: req.params.id } }
        )
        .then(response =>
          res.status(200).send({ message: "success", contractor })
        )
        .catch(error => res.status(500).send({ error: error }));
    })
    .catch(error => res.status(500).send({ error: error }));
});

router.get("/application/:id", [authToken], async (req, res) => {
  const Application = await application.findOne({
    where: { id: req.params.id }
  });
  if (!Application) return res.status(404).send({ message: "Not Found" });

  const result = await _.pick(Application, [
    "id",
    "name",
    "email",
    "number",
    "location",
    "timeIn",
    "timeOut",
    "category",
    "subCategory",
    "profileImage",
    "identity",
    "nonCriminal",
    "createdAt",
    "updatedAt"
  ]);

  res.status(200).send(result);
});

module.exports = router;
