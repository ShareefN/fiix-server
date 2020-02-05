const { application, users, contractors } = require("../models");
const _ = require("lodash");

applicationFunnel = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  if (user.dataValues.hasApplied == 1)
    return res.status(302).send({ message: "Application already sent" });

  if (user.dataValues.isRejected == 1)
    return res.status(403).send({ message: "User cannot apply" });

  const isFoundContractor = await contractors.findOne({
    where: { name: `${req.body.firstName} ${req.body.lastName}` }
  });

  if (isFoundContractor)
    return res.status(302).send({
      message: "Contractor already exsist"
    });

  const contractor = {
    name: `${req.body.firstName} ${req.body.lastName}`,
    email: user.email,
    number: user.number,
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
        .update({ hasApplied: true }, { where: { id: req.params.id } })
        .then(response =>
          res.status(200).send({ message: "success", contractor })
        )
        .catch(error => res.status(500).send({ error: error }));
    })
    .catch(error => res.status(500).send({ error: error }));
};

approveApplication = async (req, res) => {
  const applicant = await application.findOne({ where: { id: req.params.id } });
  if (!applicant)
    return res.status(404).send({ error: "Application not found" });

  await contractors
    .create(applicant.dataValues)
    .then(response => res.status(200))
    .catch(error => res.status(500).send({ error: error.message }));

  await application
    .destroy({ where: { id: req.params.id } })
    .then(response => res.status(200))
    .catch(error => res.status(500).send({ error: error }));

  await users
    .destroy({ where: { email: applicant.email } })
    .then(response => res.status(200))
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
    .then(async response => {
      await applicant
        .destroy({ where: { id: req.params.id } })
        .then(() => res.status(200).send({ message: "User rejected" }));
    });
};

getApplications = async (req, res) => {
  const Applications = await application.findAll();
  res.status(200).send(Applications);
};

module.exports = {
  applicationFunnel,
  approveApplication,
  rejectApplication,
  getApplications
};
