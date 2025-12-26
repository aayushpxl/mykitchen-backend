const { z } = require("zod");

const IngredientSchema = z.object({
    name: z.string().min(1),
    quantity: z.string().optional(),
    unit: z.string().optional()
});

const CreateRecipeSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().optional().or(z.literal('')), // Allow empty string or valid URL if needed, but relaxed for now
    cookingTime: z.string().optional().or(z.literal('')),
    difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
    status: z.enum(["pending", "approved", "rejected", "private"]).optional(),
    ingredients: z.array(IngredientSchema).min(1, "At least one ingredient required"),
    steps: z.array(z.string().min(1)).min(1, "At least one step required"),
    nutrition: z.object({
        calories: z.string().optional(),
        protein: z.string().optional(),
        carbs: z.string().optional(),
        fat: z.string().optional()
    }).optional(),
    substitutes: z.array(z.object({
        ingredient: z.string(),
        alternatives: z.array(z.string())
    })).optional()
});

const UpdateRecipeSchema = CreateRecipeSchema.partial();

module.exports = { CreateRecipeSchema, UpdateRecipeSchema };
