const express = require("express");
const router = express.Router();
const { register, login, getMe } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Logged-in user profile
router.get("/me", authenticateUser, getMe);

module.exports = router;
