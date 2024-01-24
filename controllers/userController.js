const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwtMiddleware = require("../middleware/jwtMiddleware");

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if the email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const saltRounds = 10; // The number of salt rounds for hashing

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Create a new user
    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Registration failed", details: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user exists in the database using their email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate a JWT token and send it to the client
    const token = jwtMiddleware.generateToken({
      userId: user._id,
      isPremiumUser: user.isPremiumUser,
    });

    res.status(200).json({
      message: "User logged in successfully",
      userId: user._id,
      username: user.username,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed", details: error.message });
  }
};
