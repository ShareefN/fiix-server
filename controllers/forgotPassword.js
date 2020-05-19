const express = require("express");
const router = express.Router();
// const { users } = require("../models");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey('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');

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
