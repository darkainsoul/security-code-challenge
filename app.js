const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { Console } = require("console");
require("dotenv").config();
const rateLimit = require("express-rate-limit");
const Joi = require("joi");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Número máximo de solicitudes por ventana
});

const schema = Joi.object({
  amount: Joi.number().required(),
});

// Create an instance of Express.js
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

// Initialize user account balance
let accountBalance = 0;

app.get("/login", (req, res) => {
  res.send(
    '<html><head></head><form method="post" action="/auth"><input type="button" value="Login"></form><body></body></html>'
  );
});

app.post("/auth", (req, res) => {
  // Get the data from the Form or any input if thats exists
  const { username, password } = req.body;

  // Validate in the Database, LDAP or any other place in this case we set a default value just for the test, this is not a good practice
  const user = { username: "code_challenge" };

  const accessToken = generateAccessToken(user);
  console.log("accessToken:", accessToken);
  res.header("authorization", accessToken).json({
    message: "Valid user",
    token: accessToken,
  });
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.SECRET, { expiresIn: "5m" });
}

function validateToken(req, res, next) {
  const accessToken = req.get("authorization");
  if (!accessToken) res.send("Access denied");

  jwt.verify(accessToken, process.env.SECRET, (err, user) => {
    if (err) {
      res.send("Access denied, token expired or incorrect");
    } else {
      req.user = user;
      next();
    }
  });
}

app.get("/balance", limiter, validateToken, (req, res) => {
  res.json({ balance: accountBalance });
});

// Endpoint to make a deposit
app.post("/deposit", limiter, validateToken, (req, res) => {
  console.log("req:", req.body);
  const { amount } = schema.validate(req.body);

  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  accountBalance += amount;
  res.json({ message: "Deposit successful" });
});

// Endpoint to process a withdrawal
app.post("/withdraw", limiter, validateToken, (req, res) => {
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
