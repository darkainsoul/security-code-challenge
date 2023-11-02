const express = require("express");
const bodyParser = require("body-parser");

// Create an instance of Express.js
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize user account balance
let accountBalance = 0;

// Endpoint to retrieve account balance
app.get("/balance", (req, res) => {
  res.json({ balance: accountBalance });
});

// Endpoint to make a deposit
app.post("/deposit", (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  accountBalance += amount;
  res.json({ message: "Deposit successful" });
});

// Endpoint to process a withdrawal
app.post("/withdraw", (req, res) => {
  const { amount } = req.body;

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  if (amount > accountBalance) {
    return res.status(400).json({ error: "Insufficient funds" });
  }

  accountBalance -= amount;
  res.json({ message: "Withdrawal successful" });
});

// Start the server
app.listen(3000, () => {
  console.log("Mock Bank API server is running on port 3000");
});
