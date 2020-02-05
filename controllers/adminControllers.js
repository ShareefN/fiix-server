const { contractors, users } = require("../models");
const _ = require("lodash");

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
  await users.update(
    {
      isProhibited: false,
      prohibitedReason: null
    },
    { where: { id: req.params.id } }
  ).then(() => res.status(200).send({ message: "User unprohibited" }))
  .catch(err => res.status(500).send({ error: err.message }));
};

module.exports = {
  getContractors,
  getUsers,
  blockUser,
  unBlockUser
};
