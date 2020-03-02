const express = require('express');
const router = express.Router();
const authToken = require('../middleware/authenticate');
const _ = require('lodash');
const {reports, users} = require('../models');

router.post('/report/:id', [authToken], async (req, res) => {
  const user = await users.findOne({where: {id: req.params.id}})
  if(!user) return res.status(404).send({message: "Not found"})

  const report = {
    username: user.username,
    number: user.number,
    report: req.body.report
  }

  await reports.create(report)
  .then(() => res.status(200).send({message: 'success'}))
  .catch(err => res.status(500).send({error: err.messgae}))
})

router.put('/update/report/:reportId', [authToken], async (req, res) => {
  const report = await reports.findOne({where: {id: req.params.reportId}})
  if(!report) return res.status(404).send({message: 'Not Found'})

  await reports.update(req.body, {where: {id: req.params.reportId}})
  .then(() => res.status(200).send({message: 'success'}))
  .catch(err => res.status(500).send({error: err.message}))
})

module.exports = router