const express = require("express");
const router = express.Router();
// const { users } = require("../models");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/forgotpassword", async (req, res) => {
  const msg = {
    to: "shareefnuseibeh1@yahoo.com",
    from: "fiixcareers@gmail.com",
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>"
  };
  sgMail.send(msg);
});

module.exports = router;
