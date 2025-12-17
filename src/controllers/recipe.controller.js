const recipeService = require("../services/recipe.service");
const { CreateRecipeSchema } = require("../types/recipe.types");

exports.getAllRecipes = async (req, res) => {
    try {
        const recipes = await recipeService.getAllRecipes();
        res.json(recipes);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getRecipeById = async (req, res) => {
    try {
        // req.user might be undefined if guest (middleware should optional-pass or we handle public routes separately)
        // Actually, we'll make this route "optional auth" in middleware or check header manually if not using middleware
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
        const validation = CreateRecipeSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ errors: validation.error.flatten() });
        }

        const recipe = await recipeService.createRecipe(validation.data, req.user);
        res.status(201).json(recipe);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
