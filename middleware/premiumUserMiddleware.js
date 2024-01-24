// premiumUserMiddleware.js
module.exports.checkPremiumUser = (req, res, next) => {
  const isPremiumUser = req.headers["x-is-premium"] === "true";

  if (isPremiumUser) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Access forbidden for non-premium users" });
  }
};
