const express = require("express");
const router = express.Router();

// Logout route
router.get("/logout", (req, res) => {
  // Use req.logout() with a callback function
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.redirect("/");
    }

    // Use req.session.destroy() to destroy the session
    req.session.destroy((destroyErr) => {
      if (destroyErr) {
        console.error("Error destroying session:", destroyErr);
        return res.redirect("/");
      }

      // Redirect to the login page or home page after logout
      res.redirect("/login"); // Change this to the desired logout redirect destination
    });
  });
});

module.exports = router;