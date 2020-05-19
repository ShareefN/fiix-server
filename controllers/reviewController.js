const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const { reviews, users } = require("../models");
const _ = require("lodash");

router.post("/add/review/user/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const review = {
    userId: user.id,
    username: user.username,
    number: user.number,
    review: req.body.review,
    likes: 0
  };

  await reviews
    .create(review)
    .then(() => res.status(201).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.delete(
  "/delete/review/:reviewId/user/:id",
  [authToken],
  async (req, res) => {
    const review = await reviews.findOne({
      where: { id: req.params.reviewId }
    });
    if (!review) return res.status(404).send({ message: "Review not found" });

    const user = await users.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (review.userId !== user.id)
      res.status(403).send({
        message: "Action deined"
      });

    await reviews
      .destroy({ where: { id: req.params.reviewId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

module.exports = router;

