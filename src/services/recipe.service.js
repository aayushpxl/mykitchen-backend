const Recipe = require("../models/Recipe");
const User = require("../models/User");

// Get all recipes (public view: only approved)
// Get all recipes (public view: only approved, Admin: can filter)
const getAllRecipes = async (user, filters = {}) => {
    let query = { status: "approved" };

    if (user && user.role === 'admin') {
        if (filters.status) {
            query.status = filters.status;
        } else {
            delete query.status;
            if (!filters.status) {
                query.status = "approved";
            }
        }
    }

    // Add Search Filters
    if (filters.search) {
        query.title = { $regex: filters.search, $options: 'i' };
    }

    if (filters.ingredients && filters.ingredients.length > 0) {
        // Find recipes that contain ALL specified ingredients
        query["ingredients.name"] = {
            $all: filters.ingredients.map(ing => new RegExp(ing, 'i'))
        };
    }

    let q = Recipe.find(query).populate("createdBy", "username").sort({ createdAt: -1 });

    if (filters.limit) {
        q = q.limit(filters.limit);
    }

    return await q;
};

// Get recipes by ID
const getRecipeById = async (id, user) => {
    const recipe = await Recipe.findById(id).populate("createdBy", "username");
    if (!recipe) throw new Error("Recipe not found");

    // Allow access if:
    // 1. Recipe is approved (public)
    // 2. User is admin
    // 3. User is the creator
    const isCreator = user && recipe.createdBy._id.toString() === user._id.toString();
    const isAdmin = user && user.role === 'admin';

    if (recipe.status !== 'approved' && !isCreator && !isAdmin) {
        throw new Error("Recipe not found or not public");
    }

    return recipe;
};

// Get logged-in user's recipes
const getUserRecipes = async (userId) => {
    return await Recipe.find({ createdBy: userId }).sort({ createdAt: -1 });
};

// Get Public User Profile & Recipes
const getPublicUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password -email"); // Sensitive data exclusion (keep role, bio, location, etc.)
    if (!user) throw new Error("User not found");

    // Only show APPROVED recipes on public profile
    const recipes = await Recipe.find({ createdBy: userId, status: 'approved' }).sort({ createdAt: -1 });

    return { user, recipes };
};

// Create a new recipe
const createRecipe = async (data, user) => {
    const isAdmin = user && user.role === 'admin';

    // Determine status
    let status = 'pending';
    if (isAdmin) {
        status = 'approved';
    } else if (data.status === 'private') {
        status = 'private'; // User requested private
    }
    // If user requested 'approved' but not admin, it stays 'pending' (default)

    const recipe = new Recipe({
        ...data,
        createdBy: user._id,
        createdByRole: user.role,
        status: status
    });
    return await recipe.save();
};

const updateRecipe = async (id, data, user) => {
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    if (user.role !== 'admin' && recipe.createdBy.toString() !== user._id.toString()) {
        throw new Error("Not authorized");
    }

    Object.assign(recipe, data);
    return await recipe.save();
};

const deleteRecipe = async (id, user) => {
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    if (user.role !== 'admin' && recipe.createdBy.toString() !== user._id.toString()) {
        throw new Error("Not authorized");
    }

    await recipe.deleteOne();
    return true;
};

// Toggle Save Recipe
const toggleSaveRecipe = async (recipeId, userId) => {
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
};

// Get Saved Recipes for a user
const getSavedRecipes = async (userId) => {
    const user = await User.findById(userId).populate({
        path: 'savedRecipes',
        populate: { path: 'createdBy', select: 'username' }
    });
    if (!user) throw new Error("User not found");
    return user.savedRecipes;
};

// Admin: Get all pending recipes
const getPendingRecipes = async () => {
    return await Recipe.find({ status: "pending" }).populate("createdBy", "username").sort({ createdAt: 1 });
};

// Admin: Update recipe status (approve/reject)
const updateRecipeStatus = async (id, status, rejectionReason) => {
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    if (!['approved', 'rejected', 'pending'].includes(status)) {
        throw new Error("Invalid status");
    }

    recipe.status = status;
    if (status === 'rejected') {
        recipe.rejectionReason = rejectionReason;
    } else {
        recipe.rejectionReason = undefined; // Clear reason if approved
    }

    return await recipe.save();
};

module.exports = {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    toggleSaveRecipe,
    updateRecipe,
    deleteRecipe,
    getUserRecipes,
    getPendingRecipes,
    getUserRecipes,
    getPendingRecipes,
    updateRecipeStatus,
    getPublicUserProfile,
    getSavedRecipes
};
