const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const { contractors, users, reviews } = require("../models");

router.get("/user/:userId", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.userId }, attributes: {exclude: ['password']} });
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
  const reviewsList = await reviews.findAll({attributes: {exclude: ['userId', 'updatedAt', 'userIds']}})
  res.status(200).send(reviewsList)
})

router.get('/test', async(req, res) => {
  res.status(200).send('this')
})

module.exports = router;
