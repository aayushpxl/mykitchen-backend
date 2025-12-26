const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const mealPlanRoutes = require("./routes/mealplannerRoute");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// JSON
app.use(express.json());

// Static Files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", require("./routes/userRoutes"));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

module.exports = app;
