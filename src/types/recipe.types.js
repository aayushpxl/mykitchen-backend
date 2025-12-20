const { z } = require("zod");

const IngredientSchema = z.object({
    name: z.string().min(1),
    quantity: z.string().optional(),
    unit: z.string().optional()
});

const CreateRecipeSchema = z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().min(10, "Description too short"),
    image: z.string().url("Invalid image URL"),
    ingredients: z.array(IngredientSchema).min(1, "At least one ingredient required"),
    steps: z.array(z.string().min(5)).min(1, "At least one step required"),
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
