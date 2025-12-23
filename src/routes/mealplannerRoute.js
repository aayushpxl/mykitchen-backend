const express = require("express");
const router = express.Router();
const { 
    getMyMealPlans, 
    saveMealPlan, 
    deleteMealPlan 
} = require("../controllers/mealPlanController"); // Ensure this path matches your file location
const { authenticateUser } = require("../middlewares/authMiddleware");

// All meal planning features are fully locked behind authentication
router.use(authenticateUser);

// GET: Fetch all meals for the user | POST: Add or Update a meal slot
router.route("/")
    .get(getMyMealPlans)
    .post(saveMealPlan);

// DELETE: Remove a specific meal entry by ID
router.route("/:id")
    .delete(deleteMealPlan);

module.exports = router;