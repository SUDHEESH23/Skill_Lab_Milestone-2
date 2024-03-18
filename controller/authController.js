// // const passport = require("passport");

// // exports.googleCallback = (req, res) => {
// //   res.redirect("/");
// // };

// const passport = require("passport");

// exports.googleCallback = (req, res) => {
//   // Assuming you have a success message to display
//   const successMessage = "Authentication with Google successful! You can now access the protected content.";

//   // Render a view or send HTML content as a response
//   res.send(`<h1>${successMessage}</h1>`);
// };

const passport = require("passport");

exports.googleCallback = passport.authenticate("google", {
  successRedirect: "/",
  failureRedirect: "/login", // Redirect to login page on authentication failure
});

