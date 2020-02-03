const { users } = require("../models");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const bcrypt = require("bcrypt");

validateInput = user => {
  const schema = {
    username: Joi.string()
      .min(3)
      .max(100)
      .required(),
    email: Joi.string()
      .min(5)
      .max(100)
      .required()
      .email(),
    number: Joi.string()
      .min(8)
      .max(11)
      .required(),
    password: Joi.string()
      .min(6)
      .max(1024)
      .required()
  };
  return Joi.validate(user, schema);
};

generateAuthToken = user => {
  const token = jwt.sign({ id: user.id }, config.get("jwtPrivateKey"));
  return token;
};

registerUser = async (req, res) => {
  const {error} = validateInput(req.body)
  if(error) return res.status(400).send({message: error.message})

  const isFound = await users.findOne({where: {email: req.body.email}})
  if(isFound) return res.status(409).send({message: "User already exists"})

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  users.create(req.body)
  .then(async user => {
    const result = _.pick(user, ['username', 'email', 'number'])
    res.status(201).send(user)
  })
  .catch(err => {
    res.status(500).send({message: err.message})
  })

}

module.exports = {
  registerUser
};