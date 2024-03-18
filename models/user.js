const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  email:String,
  role: { type: String, enum: ["admin", "superuser", "user"], default: "user" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
