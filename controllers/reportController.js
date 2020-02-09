const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authenticate');
const _ = require('lodash');
const {reports, users} = require('../models');

router.post('/report/:id', [authToken], async (req, res) => {
  const user = await users.findOne({where: {id: req.params.id}})
  if(!user) return res.status(404).send({message: "Not found"})

  const report = {
    username: user.dataValues.username,
    number: user.dataValues.number,
    report: req.body.report
  }

  await reports.create(report)
  .then(() => res.status(200).send({message: 'success'}))
  .catch(err => res.status(500).send({error: err.messgae}))
})

module.exports = router