const express = require("express");
const router = express.Router();
const { getAllRecipes, getRecipeById, createRecipe, toggleSave, updateRecipe, deleteRecipe, getMyRecipes, getPendingRecipes, updateRecipeStatus } = require("../controllers/recipe.controller");
const { authenticateUser, optionalAuth } = require("../middlewares/authMiddleware");

router.get("/my-recipes", authenticateUser, getMyRecipes); // Protected - GET YOUR RECIPES
router.get("/admin/pending", authenticateUser, getPendingRecipes); // Admin Only
router.put("/:id/status", authenticateUser, updateRecipeStatus); // Admin Only

router.get("/", optionalAuth, getAllRecipes); // Public (optional auth for admin filtering)
router.get("/:id", optionalAuth, getRecipeById); // Public/Private hybrid
router.post("/:id/save", authenticateUser, toggleSave); // Protected
router.post("/", authenticateUser, createRecipe); // Restricted
router.put("/:id", authenticateUser, updateRecipe); // Restricted (Owner/Admin)
router.delete("/:id", authenticateUser, deleteRecipe); // Restricted (Owner/Admin)

module.exports = router;
