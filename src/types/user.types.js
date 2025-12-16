const { z } = require("zod");

// Domain Validation Schema (Abstract Data Definition)
const UserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters").max(30),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().default("normal"),
});

module.exports = { UserSchema };
