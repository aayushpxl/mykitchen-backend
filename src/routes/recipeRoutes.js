const express = require("express");
const router = express.Router();
const {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    toggleSave,
    updateRecipe,
    deleteRecipe,
    getMyRecipes,
    getPendingRecipes,
    updateRecipeStatus,
    getSavedRecipes,
    createReview,
    deleteReview
} = require("../controllers/recipe.controller");
const { authenticateUser, optionalAuth } = require("../middlewares/authMiddleware");
const { recipeUpload } = require("../middlewares/multerConfig");

router.get("/my-recipes", authenticateUser, getMyRecipes); // Protected - GET YOUR RECIPES
router.get("/admin/pending", authenticateUser, getPendingRecipes); // Admin Only
router.put("/:id/status", authenticateUser, updateRecipeStatus); // Admin Only

router.get("/", optionalAuth, getAllRecipes); // Public (optional auth for admin filtering)
router.get("/:id", optionalAuth, getRecipeById); // Public/Private hybrid
router.get("/saved/all", authenticateUser, getSavedRecipes); // Get all saved recipes
router.post("/:id/save", authenticateUser, toggleSave); // Protected
router.post("/:id/review", authenticateUser, createReview); // Protected - SUBMIT REVIEW
router.delete("/:id/review/:reviewId", authenticateUser, deleteReview); // Protected - DELETE REVIEW
router.post("/", authenticateUser, recipeUpload.single("image"), createRecipe); // Restricted
router.put("/:id", authenticateUser, recipeUpload.single("image"), updateRecipe); // Restricted (Owner/Admin)
router.delete("/:id", authenticateUser, deleteRecipe); // Restricted (Owner/Admin)

module.exports = router;
