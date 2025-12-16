const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
// Logged-in user profile
router.get("/me", authenticateUser, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

module.exports = router;
