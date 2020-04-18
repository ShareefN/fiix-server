const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");
const { contractors, admins } = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"), {
    expiresIn: 11589000
  });
  return token;
};

router.post("/create/admin", async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const admin = await admins.findOne({
    where: { email: req.body.email }
  });
  if (admin) return res.status(302).send({ message: "Admin already exsits" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email },
    attributes: {
      exclude: [
        "password",
        "gender",
        "location",
        "timeIn",
        "timeOut",
        "category",
        "profileImage",
        "identity",
        "nonCriminal",
        "rating",
        "notes",
        "createdAt",
        "updatedAt"
      ]
    }
  });
  if (isContractor)
    return res.status(302).send({
      message: "Email already registered as contractor",
      contractor: isContractor
    });

  const salt = await bcrypt.genSalt(10);
  const loginPassword = await bcrypt.hash("123123", salt);

  await admins
    .create({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      notes: req.body.notes,
      password: loginPassword,
      role: req.body.role,
      status: "active"
    })
    .then(async admin => {
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "phone",
        "notes",
        "role",
        "status"
      ]);

      res.status(200).send({ message: "success", result });
    })
    .catch(err => res.status(500).send({ error: err.message }));
});

module.exports = router;
