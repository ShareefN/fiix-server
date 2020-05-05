const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const authToken = require("../middleware/authenticate");
const _ = require("lodash");
const {
  contractors,
  users,
  reports,
  reviews,
  contractorReviews
} = require("../models");

generateAuthToken = admin => {
  const token = jwt.sign({ admin }, config.get("jwtPrivateKey"));
  return token;
};

router.post("/user/register", async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const isFound = await users.findOne({ where: { email: req.body.email } });
  if (isFound) return res.status(409).send({ message: "User already exists" });

  const isContractor = await contractors.findOne({
    where: { email: req.body.email }
  });
  if (isContractor)
    return res.status(409).send({ message: "Contractor already exists" });

  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);

  await users
    .create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      number: req.body.number,
      status: "active",
      applicationStatus: "new"
    })
    .then(async user => {
      const token = await generateAuthToken(user);
      const User = await _.pick(user, [
        "id",
        "username",
        "email",
        "number",
        "status"
      ]);

      res
        .status(201)
        .header("Authorization", token)
        .send({ message: "success", User, token });
    })
    .catch(error => {
      res.status(500).send({ error: error });
    });
});

router.post("/user/login", async (req, res) => {
  const user = await users.findOne({ where: { email: req.body.email } });
  if (!user)
    return res.status(404).send({ message: "Invalid email or password" });

  if (user.status !== "active")
    return res.status(403).send({ message: `User account is ${user.status}` });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(404).send({ message: "Invalid email or password" });

  const token = await generateAuthToken(user);
  const User = await _.pick(user, [
    "id",
    "username",
    "email",
    "number",
    "status"
  ]);

  res
    .status(200)
    .header("Authorization", token)
    .send({ message: "success", User, token });
});

router.get("/user/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const result = await _.pick(user, [
    "id",
    "username",
    "email",
    "number",
    "status",
    "notes",
    "createdAt",
    "updatedAt"
  ]);
  res.status(200).send(result);
});

router.put("/update/user/:id", [authToken], async (req, res) => {
  if (!req.body) return res.status(400).send({ message: "Bad Request" });

  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ error: "User not found" });

  if (req.body.username) {
    const user = await users.findOne({
      where: { username: req.body.username }
    });
    if (user && user.id.toString() !== req.params.id)
      return res.status(302).send({ message: "Username already taken" });
  }

  if (req.body.email) {
    const user = await users.findOne({ where: { email: req.body.email } });
    if (user && user.id.toString() !== req.params.id) return res.status(302).send({ message: "Email already registerd" });
  }

  if (req.body.number) {
    const user = await users.findOne({ where: { number: req.body.number } });
    if (user && user.id.toString() !== req.params.id)
      return res.status(302).send({ message: "Number already registerd" });
  }

  await users.update(req.body, { where: { id: req.params.id } });

  res.status(200).send({ message: "User successfully updated" });
});

router.put("/update/user/password/:id", [authToken], async (req, res) => {
  const user = await users.findOne({ where: { id: req.params.id } });
  if (!user) return res.status(404).send({ message: "User not found" });

  const validatePassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!validatePassword)
    return res.status(400).send({ message: "Password is invalid" });

  const salt = await bcrypt.genSalt(10);
  req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt);

  await users
    .update(
      { password: req.body.newPassword },
      { where: { id: req.params.id } }
    )
    .then(() =>
      res.status(200).send({ message: "Password successfully updated" })
    )
    .catch(err => res.status(500).send({ error: err.message }));
});

router.put("/deactivate/user/:id", [authToken], async (req, res) => {
  const isFound = await users.findOne({ where: { id: req.params.id } });
  if (!isFound) return res.status(404).send({ message: "User not found" });

  if (isFound.status !== "active")
    return res
      .status(400)
      .send({ message: `User account already ${isFound.status}` });

  await users
    .update({ status: "deactivated" }, { where: { id: req.params.id } })
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.post("/forgot/password", async (req, res) => {
  const user = await users.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(404).send({ message: "Not found" });

  // send email to user with input to enter new password
});

router.post("/report/:userId", [authToken], async (req, res) => {
  if (!req.body.report) return res.status(404).send({ message: "Bad Request" });

  const user = await users.findOne({ where: { id: req.params.userId } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const report = {
    userId: user.id,
    username: user.username,
    number: user.number,
    report: req.body.report
  };

  await reports
    .create(report)
    .then(() => res.status(200).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.messgae }));
});

router.get("/reviews", [authToken], async (req, res) => {
  const Reviews = await reviews.findAll({
    attributes: { exclude: ["likes", "userIds", "number", "updatedAt"] }
  });

  res.status(200).send(Reviews);
});

router.post("/review/user/:userId", [authToken], async (req, res) => {
  if (!req.params.userId || !req.body.review)
    return res.status(400).send({ message: "Bad Request" });

  const user = await users.findOne({ where: { id: req.params.userId } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const review = {
    userId: user.id,
    username: user.username,
    number: user.number,
    review: req.body.review
  };

  await reviews
    .create(review)
    .then(() => res.status(201).send({ message: "success" }))
    .catch(err => res.status(500).send({ error: err.message }));
});

router.delete(
  "/review/:reviewId/user/:userId",
  [authToken],
  async (req, res) => {
    if (!req.params.reviewId || !req.params.userId)
      return res.status(400).send({ message: "Bad Request" });

    const review = await reviews.findOne({
      where: { id: req.params.reviewId }
    });
    if (!review) return res.status(404).send({ message: "Review Not found" });

    if (review.userId != req.params.userId)
      return res.status(404).send({ message: "Action denied" });

    await reviews
      .destroy({ where: { id: req.params.reviewId } })
      .then(() => res.status(201).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err }));
  }
);

router.get("/contractors/:category", [authToken], async (req, res) => {
  if (!req.params.category)
    return res.status(400).send({ message: "Bad Request" });

  const list = await contractors.findAll({
    where: { category: req.params.category, status: "active" },
    attributes: {
      exclude: [
        "password",
        "identity",
        "nonCriminal",
        "notes",
        "updatedAt",
        "email",
        "number",
        "gender",
        "createdAt"
      ]
    }
  });

  res.status(200).send(list);
});

router.get("/contractor/:contractorId", [authToken], async (req, res) => {
  if (!req.params.contractorId)
    return res.status(404).send({ message: "Bad Request" });

  const contractor = await contractors.findOne({
    where: { id: req.params.contractorId },
    attributes: {
      exclude: [
        "gender",
        "email",
        "password",
        "identity",
        "category",
        "identity",
        "nonCriminal",
        "status",
        "notes",
        "updatedAt"
      ]
    }
  });
  if (!contractor) return res.status(404).send({ message: "Not found" });

  res.status(200).send(contractor);
});

router.get("/contractor/:contractorId/reviews", authToken, async (req, res) => {
  if (!req.params.contractorId)
    return res.status(400).send({ message: "Bad request" });

  const reviews = await contractorReviews.findAll({
    where: { contractorId: req.params.contractorId }
  });

  res.status(200).send(reviews);
});

router.post(
  "/contractor/:contractorId/user/:userId/review",
  [authToken],
  async (req, res) => {
    if (!req.params.contractorId || !req.params.userId || !req.body.review)
      return res.status(400).send({ message: "Bad request" });

    const contractor = await contractors.findOne({
      where: { id: req.params.contractorId }
    });
    if (!contractor)
      return res.status(404).send({ message: "Invalid contractor Id" });

    const user = await users.findOne({ where: { id: req.params.userId } });
    if (!user) return res.status(404).send({ message: "Invalid user id" });

    await contractorReviews
      .create({
        contractorId: contractor.id,
        userId: user.id,
        username: user.username,
        review: req.body.review
      })
      .then(() => res.status(201).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err }));
  }
);

router.delete(
  "/contractorsreview/:reviewId/user/:userId",
  authToken,
  async (req, res) => {
    if (!req.params.reviewId || !req.params.userId)
      return res.status(400).send({ message: "Bad request" });

    const review = await contractorReviews.findOne({
      where: { id: req.params.reviewId }
    });
    if (!review) return res.status(404).send({ message: "Invalid review Id" });

    if (review.userId != req.params.userId)
      return res.status(400).send({ message: "Action denied" });

    await contractorReviews
      .destroy({ where: { id: req.params.reviewId } })
      .then(() => res.status(200).send({ message: "success" }))
      .catch(err => res.status(500).send({ error: err }));
  }
);

module.exports = router;
