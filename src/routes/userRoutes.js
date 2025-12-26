const express = require("express");
const router = express.Router();
const { getUserProfile } = require("../controllers/recipe.controller"); // Temporarily using recipe controller since logic is there

router.get("/:userId/profile", getUserProfile);

// @desc    Get User By ID
// @route   GET /api/users/:id
// @access  Public (or Private depending on need, but User request implies admin access which has token)
const { getUserById } = require("../controllers/adminController"); // Reusing this for now as it has stats
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

// If this is for admin details, strictly protect it. If for public profile, use a different one or allow public.
// The user prompt was "AdminUserDetail... 404".
router.get("/:id", authenticateUser, isAdmin, getUserById);

module.exports = router;
