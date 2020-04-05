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
const authToken = require("../middleware/authenticate");

router.post("/stats", [authToken], async (req, res) => {
  const admin = await admins.findAll();
  const appli = await application.findAll();
  const categorie = await categories.findAll();
  const contractor = await contractors.findAll();
  const report = await reports.findAll();
  const testCases = await TestCases.findAll();
  const user = await users.findAll();
  const review = await reviews.findAll();

  await stats.destroy({
    where: {},
    truncate: true
  });

  await stats
    .create({
      users: user.length,
      contractors: contractor.length,
      categories: categorie.length,
      applications: appli.length,
      feedbacks: report.length,
      testCases: testCases.length,
      admins: admin.length,
      reviews: review.length
    })
    .then(async () => {
      const statistics = await stats.findAll({
        attributes: { exclude: ["id", "createdAt", "updatedAt"] }
      });
      res.status(200).send(statistics);
    })
    .catch(err => res.stats(500).send({ error: err.message }));
});

module.exports = router;
