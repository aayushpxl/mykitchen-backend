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
            // Admin sees all recipes unless a specific status is filtered
            query = {};
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

    let q = Recipe.find(query)
        .populate("createdBy", "username")
        .populate("reviews.user", "username profilePic bio");

    let results = await q;

    // Recommendation logic: sort by matching interests if user is logged in
    if (user && user.interests && user.interests.length > 0) {
        results = results.map(recipe => {
            const recipeTags = Array.isArray(recipe.tags) ? recipe.tags : [];
            // Count how many of user interests match this recipe's tags
            const matchCount = user.interests.filter(interest =>
                recipeTags.some(tag => typeof tag === 'string' && tag.toLowerCase() === interest.toLowerCase())
            ).length;

            // Also check if title/category matches for extra relevance
            const categoryMatch = (recipe.category && typeof recipe.category === 'string' && user.interests.some(interest =>
                recipe.category.toLowerCase() === interest.toLowerCase()
            )) ? 1 : 0;

            return { ...recipe.toObject(), relevanceScore: matchCount + categoryMatch };
        }).sort((a, b) => {
            // Priority 1: Relevance Score
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            // Priority 2: Creation Date
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    } else {
        // Default sort by date
        results = results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (filters.limit) {
        results = results.slice(0, filters.limit);
    }

    return results;
};

// Get recipes by ID
const getRecipeById = async (id, user) => {
    const recipe = await Recipe.findById(id)
        .populate("createdBy", "username profilePic bio")
        .populate("reviews.user", "username profilePic bio");
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

const addReview = async (recipeId, userId, { rating, comment }) => {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error("Recipe not found");

    // Push new review
    recipe.reviews.push({
        user: userId,
        rating,
        comment
    });

    await recipe.save();

    return await Recipe.findById(recipeId)
        .populate("createdBy", "username profilePic bio")
        .populate("reviews.user", "username profilePic bio");
};

const deleteReview = async (recipeId, reviewId, userId, userRole) => {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error("Recipe not found");

    const review = recipe.reviews.id(reviewId);
    if (!review) throw new Error("Review not found");

    // Only author or admin
    if (review.user.toString() !== userId.toString() && userRole !== 'admin') {
        throw new Error("Not authorized");
    }

    recipe.reviews.pull(reviewId);
    await recipe.save();

    return await Recipe.findById(recipeId)
        .populate("createdBy", "username profilePic bio")
        .populate("reviews.user", "username profilePic bio");
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
    updateRecipeStatus,
    getPublicUserProfile,
    getSavedRecipes,
    addReview,
    deleteReview
};
