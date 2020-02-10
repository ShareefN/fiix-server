const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const superAdmin = require("../middleware/superAdmin");
const _ = require("lodash");
const {
  contractors,
  users,
  admins,
  application,
  reports
} = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"), {
    expiresIn: 11589000
  });
  return token;
};

router.post("/create/admin", [authToken, superAdmin], async (req, res) => {
  const admin = await admins.findOne({ where: { email: req.body.email } });
  if (admin) return res.status(302).send({ message: "Admin already exsits" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email }
  });
  if (isContractor)
    return res
      .status(302)
      .send({ message: "Email already registered as contractor" });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await admins
    .create(req.body)
    .then(async admin => {
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "isSuperAdmin"
      ]);

      res.status(201).send({ message: "success", result });
    })
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/auth/login", async (req, res) => {
  const admin = await admins.findOne({ where: { email: req.body.email } });
  if (!admin)
    return res.status(404).send({ message: "Invalid email or password" });

  if (admin.dataValues.isDeactivated == 1)
    return res.status(401).send({ message: "Account is deactivated" });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(admin);
  const result = await _.pick(admin, ["id", "name", "name", "isSuperAdmin"]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", result, token });
});

router.post("/approve/application/:id", [authToken], async (req, res) => {
  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  await contractors
    .create(applicant.dataValues)
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error.message }));

  await application
    .destroy({ where: { id: req.params.id } })
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error }));

  await users
    .destroy({ where: { email: applicant.email } })
    .then(() => res.status(200))
    .catch(error => res.status(500).send({ error: error }));

  const result = _.pick(applicant, [
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
    "nonCriminal"
  ]);

  res.status(200).send({ message: "success", result });
});

router.post("/reject/application/:id", [authToken], async (req, res) => {
  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  await users
    .update(
      {
        rejectedReason: req.body.rejectedReason,
        isRejected: true,
        hasApplied: false
      },
      { where: { email: applicant.email } }
    )
    .then(async () => {
      await applicant
        .destroy({ where: { id: req.params.id } })
        .then(() => res.status(200).send({ message: "User rejected" }));
    });
});

router.get("/contractors", [authToken], async (req, res) => {
  const Contractors = await contractors.findAll();
  res.status(200).send(Contractors);
});

router.get("/users", [authToken], async (req, res) => {
  const Users = await users.findAll();
  res.status(200).send(Users);
});

router.get("/applications", [authToken], async (req, res) => {
  const Applications = await application.findAll();
  res.status(200).send(Applications);
});

router.get("/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  const result = await _.pick(User, [
    "id",
    "username",
    "email",
    "number",
    "hasApplied",
    "isRejected",
    "isProhibited",
    "isDeactivated",
    "rejectedReason",
    "prohibitedReason",
    "createdAt",
    "updatedAt"
  ]);

  res.status(200).send(result);
});

router.get("/contractor/:id", [authToken], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  const result = await _.pick(Contractor, [
    "id",
    "name",
    "number",
    "email",
    "location",
    "timeIn",
    "timeOut",
    "category",
    "profileImage",
    "identity",
    "nonCriminal",
    "rating",
    "isLost",
    "createdAt",
    "updatedAt"
  ]);

  res.status(200).send(result);
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

router.put("/prohibit/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.dataValues.isProhibited == 1)
    return res.status(400).send({
      message: "User already prohibited",
      reason: User.dataValues.prohibitedReason
    });

  await users
    .update(
      { isProhibited: true, prohibitedReason: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/unProhibit/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.dataValues.isProhibited == false)
    return res.status(400).send({
      message: "User is not prohibited"
    });

  await users
    .update(
      { isProhibited: false, prohibitedReason: null },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "User activated" }))
    .catch(err => res.status(500).send({ error: err.messge }));
});

router.put("/activate/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.dataValues.isDeactivated == 0)
    return res.status(400).send({ message: "Account already active" });

  await users
    .update({ isDeactivated: false }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/prohibit/contractor/:id", [authToken], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.dataValues.isProhibited == 1)
    return res.status(400).send({
      message: "Contractor already prohibited",
      reason: Contractor.dataValues.prohibitedReason
    });

  await contractors
    .update(
      { isProhibited: true, prohibitedReason: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/unprohibit/contractor/:id", [authToken], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.dataValues.isProhibited == false)
    return res.status({ message: "Contractor account is already active" });

  await contractors
    .update(
      { isProhibited: false, prohibitedReason: null },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/contractor/:id", [authToken], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.dataValues.isLost == false)
    return res.status(400).send({ message: "Contractor already active" });

  await contractors
    .update({ isLost: false }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/update/admin/password/:id", [authToken], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send("Not found");

  const verifyPassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!verifyPassword)
    return res.status(400).send({ message: "Invalid password" });

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await admins
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/deactivate/admin/:id", [authToken], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.dataValues.isDeactivated == 1)
    return res.status(400).send({ message: "Admin already deactived" });

  await admins
    .update({ isDeactivated: true }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/admin/:id", [authToken], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.dataValues.isDeactivated == false)
    return res.status(400).send({ message: "Admin already active" });

  await admins
    .update({ isDeactivated: false }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/handle/report/:id", [authToken], async (req, res) => {
  const isFound = await reports.findOne({ where: { id: req.params.id } });
  if (!isFound) return res.status(404).send({ message: "Not found" });

  await reports
    .update({ notes: req.body.note }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

module.exports = router;
