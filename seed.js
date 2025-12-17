const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Recipe = require("./src/models/Recipe");
const User = require("./src/models/User");

dotenv.config();

const seedRecipes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Create a dummy author
        let author = await User.findOne({ email: "chef@example.com" });
        if (!author) {
            author = await User.create({
                username: "Chef Ramsay",
                email: "chef@example.com",
                password: "password123", // Manually hashed or just rely on service (but here direct)
                // Note: In real app use AuthService to register to get hash. 
                // For seeding strictly for recipe display, this usage is fine as we won't login as him often.
                role: "admin"
            });
            console.log("Created Author: Chef Ramsay");
        }

        // 2. Clear existing recipes? Maybe not to avoid wiping user data. 
        // Let's just check if we have recipes.
        const count = await Recipe.countDocuments();
        if (count > 0) {
            console.log("Recipes already exist. Skipping seed.");
            process.exit();
        }

        // 3. Seed Recipes
        const recipes = [
            {
                title: "Margherita Pizza",
                description: "A classic Italian pizza with fresh basil, mozzarella, and tomato sauce. Perfect for a quick dinner.",
                image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                time: 30,
                difficulty: "Medium",
                calories: 800,
                category: "Pizza",
                ingredients: [
                    { name: "Pizza Dough", amount: "1 ball" },
                    { name: "Tomato Sauce", amount: "1/2 cup" },
                    { name: "Mozzarella Cheese", amount: "200g" },
                    { name: "Fresh Basil", amount: "Handful" }
                ],
                instructions: [
                    "Preheat oven to 450°F (230°C).",
                    "Roll out the dough on a floured surface.",
                    "Spread tomato sauce evenly.",
                    "Top with mozzarella and bake for 10-12 minutes.",
                    "Garnish with fresh basil."
                ],
                author: author._id
            },
            {
                title: "Chicken Salad",
                description: "A healthy grilled chicken salad with avocado and balsamic glaze.",
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                time: 20,
                difficulty: "Easy",
                calories: 450,
                category: "Salad",
                ingredients: [
                    { name: "Chicken Breast", amount: "200g" },
                    { name: "Mixed Greens", amount: "1 bag" },
                    { name: "Avocado", amount: "1" },
                    { name: "Cherry Tomatoes", amount: "10" }
                ],
                instructions: [
                    "Grill the chicken breast until cooked through.",
                    "Chop the vegetables.",
                    "Toss greens and veggies in a bowl.",
                    "Slice chicken and place on top.",
                    "Drizzle with balsamic dressing."
                ],
                author: author._id
            },
            {
                title: "Chocolate Cake",
                description: "Decadent chocolate cake with fudge frosting. A sweet treat for any occasion.",
                image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                time: 60,
                difficulty: "Hard",
                calories: 1200,
                category: "Cake",
                ingredients: [
                    { name: "Flour", amount: "2 cups" },
                    { name: "Cocoa Powder", amount: "1 cup" },
                    { name: "Sugar", amount: "2 cups" },
                    { name: "Eggs", amount: "3" }
                ],
                instructions: [
                    "Mix dry ingredients in a bowl.",
                    "Beat eggs and sugar until fluffy.",
                    "Combine wet and dry ingredients.",
                    "Bake at 350°F for 45 minutes."
                ],
                author: author._id
            }
        ];

        await Recipe.insertMany(recipes);
        console.log("Seeded 3 Recipes!");
        process.exit();

    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedRecipes();
