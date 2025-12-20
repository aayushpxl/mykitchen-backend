const Recipe = require("../models/Recipe");

class RecipeRepository {
    async create(recipeData) {
        const recipe = new Recipe(recipeData);
        return await recipe.save();
    }

    async findAll(filter = {}) {
        return await Recipe.find(filter).populate("createdBy", "username email");
    }

    async findById(id) {
        return await Recipe.findById(id).populate("createdBy", "username email");
    }

    async update(id, updates) {
        return await Recipe.findByIdAndUpdate(id, updates, { new: true });
    }

    async delete(id) {
        return await Recipe.findByIdAndDelete(id);
    }
}

module.exports = new RecipeRepository();
