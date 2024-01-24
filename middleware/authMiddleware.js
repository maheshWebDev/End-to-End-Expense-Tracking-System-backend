const jwt = require("jsonwebtoken");

// Middleware to verify JWT and authenticate user
module.exports.authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization || req.headers.Authorization;

    // console.log("Token", token);

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await jwt.verify(token, process.env.JWT_SECRET_KEY);

    // console.log("user", user);

    if (!user) {
      return res
        .status(403)
        .json({ message: "User not found or token is invalid" });
    }

    // Attach user data to the request for subsequent controllers
    req.userId = user.userId;

    next();
  } catch (err) {
    return res.status(403).json({ message: "Forbidden" });
  }
};
