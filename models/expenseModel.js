const mongoose = require("mongoose");

// Define the expense schema
const expenseSchema = new mongoose.Schema({
  expenseType: {
    type: String,
    required: [true, "Expense type is required."],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required."],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, "Amount is required."],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Create the expense model based on the schema.
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
