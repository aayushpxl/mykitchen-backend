const recipeService = require("../services/recipe.service");
const { CreateRecipeSchema } = require("../types/recipe.types");

exports.getAllRecipes = async (req, res) => {
    try {
        const { status, limit } = req.query;
        // If query params exist, pass to service (which needs to handle them)
        // Currently service.getAllRecipes() is hardcoded to "approved".
        // functionality needs to be extended.
        const recipes = await recipeService.getAllRecipes(req.user, { status, limit: parseInt(limit) });
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        const user = req.user;
        const recipe = await recipeService.getRecipeById(req.params.id, user);
        res.json(recipe);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

exports.toggleSave = async (req, res) => {
    try {
        const { isSaved } = await recipeService.toggleSaveRecipe(req.params.id, req.user._id);
        res.json({ success: true, isSaved, message: isSaved ? "Recipe saved" : "Recipe removed from saved" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createRecipe = async (req, res) => {
    try {
        // Reuse create schema for now, or use a partial one if we want to allow partial updates (zod .partial())
        // For verify strictly:
        const validation = CreateRecipeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.flatten() });
        }

        const recipe = await recipeService.createRecipe(validation.data, req.user);
        res.status(201).json(recipe);
    } catch (error) {
        console.error("Create Recipe Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateRecipe = async (req, res) => {
    try {
        // We can create a UpdateRecipeSchema later, for now allow partial updates based on body
        const recipe = await recipeService.updateRecipe(req.params.id, req.body, req.user);
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        await recipeService.deleteRecipe(req.params.id, req.user);
        res.json({ message: "Recipe deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getMyRecipes = async (req, res) => {
    try {
        const recipes = await recipeService.getUserRecipes(req.user._id);
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const profile = await recipeService.getPublicUserProfile(userId);
        res.json(profile);
    } catch (error) {
        res.status(404).json({ message: "User not found" });
    }
};

exports.getPendingRecipes = async (req, res) => {
    try {
        // Ensure admin
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });

        const recipes = await recipeService.getPendingRecipes();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateRecipeStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Access denied" });

        const { status, rejectionReason } = req.body;
        const recipe = await recipeService.updateRecipeStatus(req.params.id, status, rejectionReason);
        res.json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
