const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();


// ✅ CORS FIRST (this handles preflight automatically)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ JSON after CORS
app.use(express.json());

// Database
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const challengeRoutes = require("./routes/challengeRoutes")

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/challenges", challengeRoutes);
module.exports = app;
