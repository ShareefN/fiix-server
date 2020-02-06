const { contractors, users, admins } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"));
  return token;
};

createAdmin = async (req, res) => {
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
      const token = await generateAuthToken(admin);
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "isSuperAdmin"
      ]);

      res
        .status(201)
        .header("x-auth-token", token)
        .send({ message: "success", result, token });
    })
    .catch(err => res.status(500).send({ error: err.message }));
};

login = async (req, res) => {
  const admin = await admins.findOne({ where: { email: req.body.email } });
  if (!admin)
    return res.status(404).send({ message: "Invalid email or password" });

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
};

updateAdminPassword = async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send("Admin not found");

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await admins
    .update({ password: req.body.newPassword }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Password updated" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

getContractors = async (req, res) => {
  const Contractors = await contractors.findAll();
  res.status(200).send(Contractors);
};

getUsers = async (req, res) => {
  const Users = await users.findAll();
  res.status(200).send(Users);
};

blockUser = async (req, res) => {
  await users
    .update(
      { isProhibited: true, prohibitedReason: req.body.prohibitedReason },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "User prohibited" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

unBlockUser = async (req, res) => {
  await users
    .update(
      {
        isProhibited: false,
        prohibitedReason: null
      },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "User unprohibited" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

deactivateContractor = async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  if (contractor.dataValues.isLost == 1)
    return res.status(400).send({ message: "Contractor is deactivated" });

  await contractors
    .update({ isLost: true }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Contractor deactivated" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

activateContractor = async (req, res) => {
  const contractor = await contractors.findOne({
    where: { id: req.params.id }
  });
  if (!contractor)
    return res.status(404).send({ message: "Contractor not found" });

  if (contractor.dataValues.isLost != 1)
    return res.status(400).send({
      message: "Contractor is active"
    });

  await contractors
    .update({ isLost: false }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Contractor activated" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

module.exports = {
  getContractors,
  getUsers,
  blockUser,
  unBlockUser,
  deactivateContractor,
  activateContractor,
  createAdmin,
  login,
  updateAdminPassword
};
