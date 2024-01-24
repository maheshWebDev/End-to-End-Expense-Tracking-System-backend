// premiumRouter.js

const express = require("express");
const premiumRouter = express.Router();
const {
  buyPremiumMembership,
  updateMembershipStatus,
} = require("../controllers/premiumController");

// Define your routes
premiumRouter.post("/buy-membership", buyPremiumMembership);
premiumRouter.post("/update-membership-status", updateMembershipStatus);

module.exports = premiumRouter;
