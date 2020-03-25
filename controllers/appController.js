const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const _ = require("lodash");
const { contractors, users, reviews } = require("../models");

router.get("/user/:userId", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.userId } });
  if (!user) return res.status(404).send({ message: "Not found" });

  if (user.status.toLowerCase() !== "active")
    return res.status(403).send({ message: `User ${user.status}` });

  res.status(200).send(user);
});

router.get("/contractors/:category", [authToken], async (req, res) => {
  const contractorsList = await contractors.findAll({
    attributes: { exclude: ['password', 'identity', 'nonCriminal', 'status', 'notes', 'updatedAt'] },
    where: { category: req.params.category, status: "active" }
  });
  
  res.status(200).send(contractorsList)
});

router.get('/reviews', [authToken], async (req, res) => {
  const reviewsList = await reviews.findAll({attributes: {exclude: ['updatedAt', 'userIds']}})
  res.status(200).send(reviewsList)
})

module.exports = router;
