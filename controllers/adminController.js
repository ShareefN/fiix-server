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
    return res.status(302).send({
      message: "Email already registered as contractor",
      contractor: isContractor
    });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await admins
    .create(req.body)
    .then(async admin => {
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "isSuperAdmin",
        "status"
      ]);

      // send email to admin with generated one time password to login

      res.status(201).send({ message: "success", nextStep: "login", result });
    })
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/auth/login", async (req, res) => {
  const admin = await admins.findOne({ where: { email: req.body.email } });
  if (!admin)
    return res.status(404).send({ message: "Invalid email or password" });

  if (admin.status !== "active")
    return res.status(403).send({ message: `Admin account ${admin.status}` });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    admin.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(admin);
  const Admin = await _.pick(admin, [
    "id",
    "name",
    "name",
    "isSuperAdmin",
    "status"
  ]);

  res
    .status(200)
    .header("x-auth-token", token)
    .send({ message: "success", nextStep: "dashboard", Admin, token });
});

router.post("/approve/application/:id", [authToken], async (req, res) => {
  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  const checkUser = await users.findOne({ where: { email: applicant.email } });
  if (
    !checkUser ||
    checkUser.status !== "active" ||
    checkUser.applicationStatus == "rejected"
  ) {
    await application
      .destroy({ where: { id: req.params.id } })
      .then(() => res.status(200))
      .catch(error => res.status(500).send({ error: error }));
    return res
      .status(403)
      .send({ UserStatus: checkUser.status, notes: checkUser.notes });
  }

  await contractors
    .create(applicant)
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
    "nonCriminal",
    "status"
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
        applicationStatus: "rejected",
        notes: req.body.rejectedReason
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
  const Contractors = await contractors.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Contractors);
});

router.get("/users", [authToken], async (req, res) => {
  const Users = await users.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Users);
});

router.get("/admins", [authToken], async (req, res) => {
  const Admins = await admins.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Admins);
});

router.get("/admin/:id", [authToken], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  const result = await _.pick(admin, [
    "id",
    "name",
    "email",
    "isSuperAdmin",
    "status",
    "createdAt",
    "updatedAt"
  ]);

  res.status(200).send({ message: "success", result });
});

router.get("/applications", [authToken], async (req, res) => {
  const Applications = await application.findAll({
    attributes: { exclude: ["password"] }
  });
  res.status(200).send(Applications);
});

router.put("/prohibit/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.status !== "active")
    return res.status(400).send({
      message: `User already ${User.status}`,
      notes: User.notes
    });

  await users
    .update(
      { status: "prohibited", notes: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/user/:id", [authToken], async (req, res) => {
  const User = await users.findOne({ where: { id: req.params.id } });
  if (!User) return res.status(404).send({ message: "Not found" });

  if (User.status == "active")
    return res.status(400).send({ message: "Account already active" });

  await users
    .update({ status: "active" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/prohibit/contractor/:id", [authToken], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.status !== "active")
    return res.status(400).send({
      message: `Contractor account already ${Contractor.status}`,
      notes: Contractor.notes
    });

  await contractors
    .update(
      { status: "prohibited", notes: req.body.notes },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/contractor/:id", [authToken, superAdmin], async (req, res) => {
  const Contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!Contractor) return res.status(404).send({ message: "Not found" });

  if (Contractor.status == "active")
    return res.status(400).send({ message: "Contractor already active" });

  await contractors
    .update({ status: "active" }, { where: { id: req.params.id } })
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

router.put("/deactivate/admin/:id", [authToken, superAdmin], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.status !== "active")
    return res.status(400).send({ message: `Admin already ${admin.status}` });

  await admins
    .update({ status: "deactivated" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success", nextStep: "login" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/prohibit/admin/:id", [authToken, superAdmin], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.status !== "active")
    return res.status(400).send({ message: `Admin account already ${admin.status}` });

  await admins
    .update({ status: "prohibited" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/activate/admin/:id", [authToken, superAdmin], async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Not found" });

  if (admin.status == "active")
    return res.status(400).send({ message: "Admin already active" });

  await admins
    .update({ status: "active" }, { where: { id: req.params.id } })
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
