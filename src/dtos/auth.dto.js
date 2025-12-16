const { z } = require("zod");
const { UserSchema } = require("../types/user.types");

// Register DTO: Input for registration
const RegisterDTO = UserSchema.pick({
    username: true,
    email: true,
    password: true,
});

// Login DTO: Input for login
const LoginDTO = z.object({
    email: z.string().email(),
    password: z.string() // Password rules might be looser for login (just needs to be a string to check)
});

// Response DTO: Output to client (exclude password)
const UserResponseDTO = UserSchema.pick({
    username: true,
    email: true,
    role: true,
}).extend({
    id: z.string().optional(), // Mongoose _id
});

module.exports = { RegisterDTO, LoginDTO, UserResponseDTO };
