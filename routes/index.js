const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Secret = require("../models/secret");
const { authenticator, totp, hotp } = require("otplib");
totp.options = {
  algorithm: "sha1",
  epoch: Date.now(),
  digits: 6,
  step: 30,
};

// Welcome Page
router.get("/", forwardAuthenticated, (req, res) => res.render("welcome"));

router.get("/refresh", (req, res) => {
  res.redirect(req.get("referer"));
});
var token = 0;
var time = 0;
// Dashboard
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Secret.find({ email: req.user.email }).then((secret) => {
    if (secret) {
      console.log(secret);
      let otps = [];
      for (let index = 0; index < secret.length; index++) {
        const check = secret[index].key;
        token = authenticator.generate(check);
        otps.push(token);
        console.log(token);
        time = totp.timeRemaining();
        console.log(time);
      }
      res.render("dashboard", {
        user: req.user,
        secret: secret,
        otps: otps,
      });
    } else {
      console.log("No Secrets Added");
      res.render("dashboard", {
        user: req.user,
      });
    }
  });
});

router.post("/dashboard", ensureAuthenticated, (req, res) => {
  const { email, service, key } = req.body;
  let errors = [];
  let secret = res.secret;
  console.log(secret);
  if (errors.length > 0) {
    res.render("dashboard", {
      errors,
      email,
      service,
      key,
      user: req.user,
      secret,
    });
  } else {
    Secret.findOne({ email: email, service: service }).then((secret) => {
      if (secret) {
        errors.push({ msg: "Service already attached" });
        res.redirect(req.get("referer"));
      } else {
        const newSecret = new Secret({
          email,
          service,
          key,
        });

        newSecret
          .save()
          .then((user) => {
            req.flash(
              "success_msg",
              " Service Added ,You can now check OTP here anytime"
            );
            res.redirect(req.get("referer"));
          })
          .catch((err) => console.log(err));
      }
    });
  }
});

module.exports = router;
