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
            createdBy: user._id,
            createdByRole: user.role || 'user'
        });
    }

    async getAllRecipes() {
        return await recipeRepository.findAll();
    }

    async getRecipeById(id, user) {
        const recipe = await recipeRepository.findById(id);
        if (!recipe) throw new Error("Recipe not found");

        const recipeObj = recipe.toObject();

        // GUEST PROTECTION LOGIC
        if (!user) {
            // Mask content for guests
            return {
                _id: recipeObj._id,
                title: recipeObj.title,
                description: recipeObj.description,
                image: recipeObj.image,
                nutrition: recipeObj.nutrition,
                createdBy: recipeObj.createdBy,
                isLocked: true,
                ingredients: [], // Hidden
                steps: [] // Hidden
            };
        }

        // Logged-in user sees full content
        return {
            ...recipeObj,
            isLocked: false
        };
    }
}

module.exports = new RecipeService();
