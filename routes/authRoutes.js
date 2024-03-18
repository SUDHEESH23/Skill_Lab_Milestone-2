const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controller/authController");

router.get(
  "/auth/google",
  passport.authenticate("google", {
    //scope: ["https://www.googleapis.com/auth/plus.login"],
    scope:["profile","email"]
  })
);
// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   authController.googleCallback
// );
router.get(
  "/auth/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      if (err) {
        console.error(err);
        return res.redirect("/login");
      }

      if (!user) {
        console.log("Authentication failed:", info);
        return res.redirect("/login");
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error(loginErr);
          return res.redirect("/login");
        }

        // Authentication successful, redirect to the desired page
        return res.redirect("/login");
      });
    })(req, res, next);
  },
  authController.googleCallback
);


module.exports = router;