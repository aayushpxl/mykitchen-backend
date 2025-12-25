const Recipe = require("../models/Recipe");
const User = require("../models/User");

exports.getAllRecipes = async () => {
    return await Recipe.find().sort({ createdAt: -1 });
};

exports.getRecipeById = async (id, user) => {
    const recipe = await Recipe.findById(id).populate("createdBy", "username");
    if (!recipe) throw new Error("Recipe not found");

    let isSaved = false;
    if (user) {
        const dbUser = await User.findById(user._id);
        if (dbUser && dbUser.savedRecipes.includes(id)) {
            isSaved = true;
        }
    }

    return { ...recipe.toObject(), isSaved };
};

exports.createRecipe = async (data, user) => {
    const newRecipe = new Recipe({
        ...data,
        createdBy: user._id,
        createdByRole: user.role
    });
    return await newRecipe.save();
};

exports.toggleSaveRecipe = async (recipeId, userId) => {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const index = user.savedRecipes.indexOf(recipeId);
    let isSaved = false;

    if (index === -1) {
        user.savedRecipes.push(recipeId);
        isSaved = true;
    } else {
        user.savedRecipes.splice(index, 1);
        isSaved = false;
    }

    await user.save();
    return { isSaved };
};

exports.updateRecipe = async (id, data, user) => {
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    // Only Admin or Creator can update
    // We can rely on controller to passing the correct user, but good to check here too or in middleware
    // For now assuming the controller ensures permissions or we just do it here
    if (user.role !== 'admin' && recipe.createdBy.toString() !== user._id.toString()) {
        throw new Error("Not authorized");
    }

    Object.assign(recipe, data);
    return await recipe.save();
};

exports.deleteRecipe = async (id, user) => {
    const recipe = await Recipe.findById(id);
    if (!recipe) throw new Error("Recipe not found");

    if (user.role !== 'admin' && recipe.createdBy.toString() !== user._id.toString()) {
        throw new Error("Not authorized");
    }

    return await Recipe.findByIdAndDelete(id);
};
