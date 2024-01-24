const Expense = require("../models/expenseModel");

const stream = require("stream");

const AWS = require("aws-sdk");
const PDFDocument = require("pdfkit");
const fs = require("fs");

module.exports.createExpense = async (req, res) => {
  try {
    const { expenseType, description, amount } = req.body;
    const userId = req.userId;

    const newExpense = await Expense.create({
      expenseType,
      description,
      amount,
      user: userId,
    });

    res
      .status(201)
      .json({ message: "Expense created successfully", data: newExpense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to create expense", error: error.message });
  }
};

module.exports.readExpense = async (req, res) => {
  try {
    const userId = req.userId;

    const expenses = await Expense.find({ user: userId });

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found for this user" });
    }

    res
      .status(200)
      .json({ message: "Expenses retrieved successfully", data: expenses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to retrieve expenses", error: error.message });
  }
};

module.exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { expenseType, description, amount } = req.body;

    const userId = req.userId;

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, user: userId },
      { expenseType, description, amount },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        message: "Expense not found or you do not have permission to update",
      });
    }

    res
      .status(200)
      .json({ message: "Expense updated successfully", data: updatedExpense });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to update expense", error: error.message });
  }
};

module.exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = req.userId;

    const deletedExpense = await Expense.findByIdAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedExpense) {
      return res.status(404).json({
        message: "Expense not found or you do not have permission to delete",
      });
    }

    res.status(204).json({
      message: "Expense deleted successfully",
      deletedExpenseId: deletedExpense._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to delete expense", error: error.message });
  }
};

function generatePDFContent(expenses) {
  const doc = new PDFDocument();

  // Add a title
  doc.fontSize(16).text("Expense Report", { align: "center" });

  // Add a line break
  doc.moveDown();

  // Reset font for expense details
  doc.font("Helvetica");
  doc.fontSize(10);

  // Iterate over expenses and add each entry to the PDF
  expenses.forEach((expense, index) => {
    doc.fontSize(10).text(`Expense Type: ${expense.expenseType}`);
    doc.fontSize(10).text(`Description: ${expense.description}`);
    doc.fontSize(10).text(`Amount: ${expense.amount}`);
  });

  // Create a readable stream from the PDF document
  const pdfContentStream = new stream.PassThrough();
  doc.pipe(pdfContentStream);
  doc.end();

  return pdfContentStream;
}

// Function to upload to S3
function uploadToS3(data, filename) {
  const BUCKET_NAME = "e2eexpensesystem";
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  let params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: data,
    ACL: "public-read",
  };

  return new Promise((resolve, reject) => {
    s3bucket.upload(params, (err, s3response) => {
      if (err) {
        reject(err);
      } else {
        resolve(s3response.Location);
      }
    });
  });
}

// Example usage in your downloadExpenses function
module.exports.downloadExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId });

    const pdfContentStream = generatePDFContent(expenses);

    // console.log(expenses);

    const filename = `Expense${req.userId}/${new Date()}.pdf`;

    const fileURL = await uploadToS3(pdfContentStream, filename);
    // console.log(fileURL);

    res.status(200).json({ fileURL: fileURL });
  } catch (error) {
    res.status(500).json({ fileURL: "", status: "fail", error: error.message });
  }
};
