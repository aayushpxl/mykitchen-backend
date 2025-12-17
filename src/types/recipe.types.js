const { z } = require("zod");

const IngredientSchema = z.object({
    name: z.string().min(1),
    amount: z.string().optional(),
});

const CreateRecipeSchema = z.object({
    title: z.string().min(3, "Title too short"),
    description: z.string().min(10, "Description too short"),
    image: z.string().url("Invalid image URL"),
    time: z.number().positive(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    calories: z.number().optional(),
    category: z.string().min(2),
    ingredients: z.array(IngredientSchema).min(1, "At least one ingredient required"),
    instructions: z.array(z.string().min(5)).min(1, "At least one step required"),
});

const UpdateRecipeSchema = CreateRecipeSchema.partial();

module.exports = { CreateRecipeSchema, UpdateRecipeSchema };
