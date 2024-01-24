const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    unique: [true, "Email is already in use."],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Password is required."],
    minlength: [6, "Password must be at least 6 characters long."],
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
});

// Create the user model based on the schema.
const User = mongoose.model("User", userSchema);

module.exports = User;
