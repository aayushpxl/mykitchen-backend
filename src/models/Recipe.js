const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, // URL
    time: { type: Number, required: true }, // in minutes
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
    },
    calories: { type: Number },
    category: { type: String, required: true }, // e.g., "Breakfast", "Pizza", "Vegan"

    // Full Content (Protected for Guests)
    ingredients: [{
        name: { type: String, required: true },
        amount: { type: String }, // e.g., "2 cups"
    }],
    instructions: [{ type: String, required: true }],

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Social
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Future implementation

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Recipe", RecipeSchema);
