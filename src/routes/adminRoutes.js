const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getDashboardAnalytics,
    getRecentActivity,
    toggleBanUser
} = require("../controllers/adminController");
const { authenticateUser, isAdmin } = require("../middlewares/authMiddleware");

// All routes here are protected and admin-only
router.use(authenticateUser);
router.use(isAdmin);

router.get("/stats", getDashboardStats);
router.get("/analytics", getDashboardAnalytics);
router.get("/recent-activity", getRecentActivity);
router.get("/users", getAllUsers);
router.put("/users/:id/ban", toggleBanUser);

module.exports = router;
