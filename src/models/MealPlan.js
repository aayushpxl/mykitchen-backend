// models/MealPlan.js
import mongoose from "mongoose";

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  dayOfWeek: { 
    type: String, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true 
  },
  mealType: { 
    type: String, 
    enum: ["breakfast", "lunch", "dinner", "snack"], 
    required: true 
  },
  note: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("MealPlan", mealPlanSchema);