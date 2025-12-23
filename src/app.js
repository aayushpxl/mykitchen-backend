const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const mealPlanRoutes = require("./routes/mealplannerRoute")

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

// Database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/meal-plans", mealPlanRoutes);

module.exports = app; // <- CommonJS
