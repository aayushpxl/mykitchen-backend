const express = require("express");
const router = express.Router();
const { register, login, getMe, updateProfile, forgotPassword, verifyOTP, resetPassword } = require("../controllers/authController");
const { authenticateUser } = require("../middlewares/authMiddleware");
const { profileUpload } = require("../middlewares/multerConfig");

router.post("/register", register);
router.post("/login", login);

// Logged-in user profile
router.get("/me", authenticateUser, getMe);
router.put("/profile", authenticateUser, profileUpload.single("profilePic"), updateProfile);

// Password Reset Flow
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;
