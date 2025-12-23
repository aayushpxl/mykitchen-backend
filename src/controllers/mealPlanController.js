// controllers/mealPlanController.js
import MealPlan from "../models/MealPlan.js";

// GET all meals for the logged-in user
export const getMyMealPlans = async (req, res) => {
  try {
    const plans = await MealPlan.find({ user: req.user.id }).populate("recipe");
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch meal plans" });
  }
};

// CREATE or UPDATE (Upsert)
export const saveMealPlan = async (req, res) => {
  const { dayOfWeek, mealType, recipeId, note } = req.body;
  try {
    // If a meal exists in this slot, update it; otherwise, create it.
    const plan = await MealPlan.findOneAndUpdate(
      { user: req.user.id, dayOfWeek, mealType },
      { recipe: recipeId, note },
      { upsert: true, new: true }
    );
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: "Error saving meal plan" });
  }
};

// DELETE a specific meal
export const deleteMealPlan = async (req, res) => {
  try {
    const plan = await MealPlan.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user.id 
    });
    if (!plan) return res.status(404).json({ message: "Meal not found" });
    res.json({ message: "Meal removed from planner" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting meal plan" });
  }
};