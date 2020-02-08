const { application, users, contractors } = require("../models");
const _ = require("lodash");

applicationFunnel = async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  if (user.dataValues.isDeactivated == 1)
    return res.status(400).send({ message: "User account is deactivated" });

  if (user.dataValues.hasApplied == 1)
    return res.status(302).send({ message: "Application already sent" });

  if (user.dataValues.isRejected == 1)
    return res.status(403).send({ message: "User applied and rejected already" });

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

module.exports = {
  applicationFunnel
};
