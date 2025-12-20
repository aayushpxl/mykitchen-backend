const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    ingredients: [{
        name: { type: String },
        quantity: { type: String },
        unit: { type: String }
    }],
    steps: [{ type: String }],
    nutrition: {
        calories: { type: String },
        protein: { type: String },
        carbs: { type: String },
        fat: { type: String }
    },
    substitutes: [{
        ingredient: { type: String },
        alternatives: [{ type: String }]
    }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByRole: { type: String, enum: ["admin", "user"] },
    isPublished: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recipe", RecipeSchema);
