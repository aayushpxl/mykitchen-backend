const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    cookingTime: { type: String }, // e.g., "30 mins"
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    category: { type: String },
    tags: [{ type: String }],
    servings: { type: Number },
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
    proTips: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByRole: { type: String, enum: ["admin", "user", "normal"] },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected", "private"],
        default: "pending"
    },
    rejectionReason: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recipe", RecipeSchema);
