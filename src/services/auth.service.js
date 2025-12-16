const userRepository = require("../repositories/user.repository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class AuthService {
    async register(registerData) {
        const { username, email, password } = registerData;

        // Business Logic: Check duplicates
        const existingEmail = await userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error("User with this email already exists");
        }

        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
            throw new Error("User with this username already exists");
        }

        // Business Logic: Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create User
        const newUser = await userRepository.create({
            username,
            email,
            password: hashedPassword
        });

        return newUser;
    }

    async login(loginData) {
        const { email, password } = loginData;

        // Check user
        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        // Generate Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "secret", // Fallback for safety
            { expiresIn: "7d" }
        );

        return { user, token };
    }
}

module.exports = new AuthService();
