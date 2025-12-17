const express = require("express");
const router = express.Router();
const { getAllRecipes, getRecipeById, createRecipe, toggleSave } = require("../controllers/recipe.controller");
const { authenticateUser, optionalAuth } = require("../middlewares/authMiddleware");

router.get("/", getAllRecipes); // Public
router.get("/:id", optionalAuth, getRecipeById); // Public/Private hybrid
router.post("/:id/save", authenticateUser, toggleSave); // Protected
router.post("/", authenticateUser, createRecipe); // Restricted

module.exports = router;
