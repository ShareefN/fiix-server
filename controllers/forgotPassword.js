const express = require("express");
const router = express.Router();
const { users } = require("../models");
const nodeMailer = require("nodemailer");

router.post("/forgotpassword", async (req, res) => {
  const user = await users.findOne({ where: { email: req.body.email } });
  if (!user) return res.status(404).send({ message: "Not found" });

  const transporter = await nodeMailer.createTransport({
    service: "gmail",
    auth: {
      user: `s.nuseibeh@eonaligner.com`,
      pass: `b5k126d7`
    }
  });

  const mailOptions = {
    from: "s.nuseibeh@eonaligner.com",
    to: `s.nuseibeh@eonaligner.com`,
    subject: "Link to reset password",
    text: "This link will help you reset your password"
  };

  transporter.sendMail(mailOptions, (err, response) => {
    if (err) return res.status(500).send({ error: err });

    return res.status(200).send({ message: "success" });
  });
});

module.exports = router;