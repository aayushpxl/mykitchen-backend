const recipeRepository = require("../repositories/recipe.repository");

const User = require("../models/User"); // Need User to update saved recipes

class RecipeService {
    // ... existing methods (createRecipe, getAllRecipes) use implicit 'this' or are static-like. 
    // Just appending method.

    async toggleSaveRecipe(recipeId, userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const isSaved = user.savedRecipes.includes(recipeId);

        if (isSaved) {
            user.savedRecipes = user.savedRecipes.filter(id => id.toString() !== recipeId);
        } else {
            user.savedRecipes.push(recipeId);
        }

        await user.save();
        return { isSaved: !isSaved };
    }

    async createRecipe(data, user) {
        return await recipeRepository.create({
            ...data,
            author: user._id
        });
    }

    async getAllRecipes() {
        // Public list (everyone can see previews)
        // We might want to limit fields here for performance, but for now full object is fine
        // as the frontend will decide what to show on the card.
        return await recipeRepository.findAll();
    }

    async getRecipeById(id, user) {
        const recipe = await recipeRepository.findById(id);
        if (!recipe) throw new Error("Recipe not found");

        // GUEST PROTECTION LOGIC
        if (!user) {
            // Mask content for guests
            // We return a "preview" version
            return {
                _id: recipe._id,
                title: recipe.title,
                description: recipe.description,
                image: recipe.image,
                time: recipe.time,
                difficulty: recipe.difficulty,
                calories: recipe.calories,
                category: recipe.category,
                author: recipe.author,
                isLocked: true, // Frontend uses this to show "Login to View"
                ingredients: [], // Hidden
                instructions: [] // Hidden
            };
        }

        // Logged-in user sees full content
        return {
            ...recipe.toObject(),
            isLocked: false
        };
    }
}

module.exports = new RecipeService();
