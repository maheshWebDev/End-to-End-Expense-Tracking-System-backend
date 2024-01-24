// leaderboardController.js
const Expense = require("../models/expenseModel");
const User = require("../models/userModel");

exports.getLeaderboardData = async (req, res) => {
  try {
    const leaderboardData = await Expense.aggregate([
      {
        $group: {
          _id: "$user",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$userDetails.username",
          totalAmount: 1,
          count: 1,
        },
      },
    ]);

    return res.status(200).json(leaderboardData);
  } catch (error) {
    console.error("Error fetching leaderboard data:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
