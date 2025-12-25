const express = require("express");
const router = express.Router();
const { getDashboardStats, getAllUsers } = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

// All routes here are protected and admin-only
router.use(authenticateUser);
router.use(isAdmin);

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);

module.exports = router;
