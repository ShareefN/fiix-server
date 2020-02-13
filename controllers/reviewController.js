const express = require("express");
const router = express.Router();
const authToken = require("../middleware/authenticate");
const { reviews, users } = require("../models");
const _ = require("lodash");

router.post("/add/review/user/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const review = {
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

router.put(
  "/update/review/:reviewId/user/:id",
  [authToken],
  async (req, res) => {
    const review = await reviews.findOne({
      where: { id: req.params.reviewId }
    });
    if (!review) return res.status(404).send({ message: "Review not found" });

    const user = await users.findOne({ where: { id: req.params.id } });
    if (!user) return res.status(404).send({ message: "User not found" });

    if (review.number !== user.number)
      res.status(403).send({
        message: "Action deined"
      });

    await reviews
      .update(req.body, { where: { id: req.params.reviewId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

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

    if (review.number !== user.number)
      res.status(403).send({
        message: "Action deined"
      });

    await reviews
      .destroy({ where: { id: req.params.reviewId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err.message }));
  }
);

router.put("/like/review/:reviewId/:userId", [authToken], async (req, res) => {
  const review = await reviews.findOne({ where: { id: req.params.reviewId } });
  if (!review) return res.status(404).send({ message: "Review not found" });

  const user = await users.findOne({ where: { id: req.params.userId } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const likeCount = review.likes;

  if(review.userIds == 0){
    const like = {
      likes: likeCount,
      userIds: JSON.stringify([req.params.userId])
    }
    
  }
});

module.exports = router;

// const likeIds = JSON.parse(reviews.userIds);
// if (likeIds.inclueds(req.params.userId)) {
//   likeIds.splice(likeIds.indexOf(req.params.userId));
//   return await reviews
//     .update({
//       likes: likeIds.length,
//       userIds: JSON.stringify(likeIds)
//     })
//     .then(() => res.status(200).send({ message: "success" }))
//     .catch(err => res.status(500).send({ error: err.message }));
// }

// console.log(likesId);
