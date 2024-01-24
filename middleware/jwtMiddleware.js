const jwt = require("jsonwebtoken");

// Function to generate a JWT
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET_KEY);
}

module.exports = { generateToken };
