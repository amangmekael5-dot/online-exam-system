const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  next();
});

// Routes
console.log('Loading auth routes...');
const authRoutes = require("./routes/authRoutes");
console.log('Auth routes loaded');
app.use("/api/auth", authRoutes);
console.log('Auth routes mounted at /api/auth');

// Home Route
app.get("/", (req, res) => {
  res.send("Exam Platform Backend Running");
});

// Test route directly in server (for comparison)
app.get("/direct-test", (req, res) => {
  res.json({ success: true, message: "Direct test works!" });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
  console.log("Available routes:");
  console.log("  GET  /");
  console.log("  GET  /direct-test");
  console.log("  GET  /api/auth/test");
  console.log("  POST /api/auth/register");
  console.log("  POST /api/auth/login");
  console.log("  GET  /api/auth/me");
});