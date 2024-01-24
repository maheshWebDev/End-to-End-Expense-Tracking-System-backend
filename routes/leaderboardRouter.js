// leaderboardRouter.js
const express = require("express");
const leaderboardRouter = express.Router();
const { getLeaderboardData } = require("../controllers/leaderboardController");

// Endpoint to get leaderboard data
leaderboardRouter.get("/leaderboard", getLeaderboardData);

module.exports = leaderboardRouter;
