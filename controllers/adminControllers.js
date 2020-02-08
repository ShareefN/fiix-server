const { contractors, users, admins, application } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const _ = require("lodash");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"), {
    expiresIn: 11589000
  });
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
      const result = await _.pick(admin, [
        "id",
        "name",
        "email",
        "isSuperAdmin"
      ]);

      res
        .status(201)
        .send({ message: "success", result });
    })
    .catch(err => res.status(500).send({ error: err.message }));
};

login = async (req, res) => {
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
};

updateAdminPassword = async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send("Admin not found");

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await admins
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() => res.status(200).send({ message: "Password updated" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

// activateAdmin = async (req, res) => {
//   const admin = await admins.findOne({where: {id: req.params.id}})
//   if(!admin) return res.status(404).send({message: 'Admin not found'})

//   if(admin.dataValues.isDeactivated === tre)
// }

deactivateAdmin = async (req, res) => {
  const admin = await admins.findOne({ where: { id: req.params.id } });
  if (!admin) return res.status(404).send({ message: "Admin not found" });

  if (admin.dataValues.isDeactivated === 1)
    return res.status(400).send({ message: "Admin already deactivated" });

  await admins
    .update({ isDeactivated: true }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "Admin deactivated" }))
    .catch(err => res.status(500).send({ error: err.message }));
};

getContractors = async (req, res) => {
  const Contractors = await contractors.findAll();
  res.status(200).send(Contractors);
};

getApplications = async (req, res) => {
  const Applications = await application.findAll();
  res.status(200).send(Applications);
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

approveApplication = async (req, res) => {
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
};

rejectApplication = async (req, res) => {
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
};

activateUser = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "user not found" });

  if (user.dataValues.isDeactivated == 0)
    return res.status(400).send({ message: "user already active" });

  await users
    .update({ isDeactivated: false }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
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
  updateAdminPassword,
  deactivateAdmin,
  getApplications,
  approveApplication,
  rejectApplication,
  activateUser
};
