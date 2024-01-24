const express = require("express");
const expenseRouter = express.Router();
const {
  createExpense,
  readExpense,
  updateExpense,
  deleteExpense,
  downloadExpenses,
} = require("../controllers/expenseController");

// expense Routes
expenseRouter.get("/expenses", readExpense);
expenseRouter.post("/expenses", createExpense);
expenseRouter.put("/expenses/:id", updateExpense);
expenseRouter.delete("/expenses/:id", deleteExpense);
expenseRouter.get("/expenses/download", downloadExpenses);

module.exports = expenseRouter;
