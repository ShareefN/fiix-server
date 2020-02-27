const express = require("express");
const router = express.Router();
const {
  admins,
  application,
  categories,
  contractors,
  reports,
  reviews,
  TestCases,
  users,
  stats
} = require("../models");
const { authToken } = require("../middleware/authenticate");

router.put("/stats", [authToken], async (req, res) => {
  const admin = await admins.findAll();
  const applications = await application.findAll();
  const categorie = await categories.findAll();
  const contractor = await contractors.findAll();
  const report = await reports.findAll();
  const testCases = await TestCases.findAll();
  const user = await users.findAll();
  const review = await reviews.findAll();
  console.log('jdaf')
  await stats.update({
      users: user.length,
      contractors: contractor.length,
      categories: categorie.length,
      applications: applications.length,
      feedbacks: report.length,
      testCases: testCases.length,
      admins: admin.length,
      reviews: review.length
    })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.stats(500).send({ error: err.message }));
});

module.exports = router;
