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

        if (user.isActive === false) {
            // Reactivate account
            user.isActive = true;
            await userRepository.update(user);
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

    async forgotPassword(email) {
        const user = await userRepository.findByEmail(email);
        if (!user) throw new Error("If an account exists for this email, you will receive an OTP.");

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiry (10 minutes)
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        user.resetOtp = otp;
        user.resetOtpExpire = expiry;
        await userRepository.update(user);

        // Send Email
        const { sendOtpEmail } = require("../utils/email.utils");
        await sendOtpEmail(email, otp);

        return true;
    }

    async verifyOTP(email, otp) {
        const user = await userRepository.findByEmail(email);
        if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            throw new Error("Invalid or expired OTP");
        }
        return true;
    }

    async resetPassword(email, otp, newPassword) {
        const user = await userRepository.findByEmail(email);
        if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
            throw new Error("Invalid or expired OTP");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP fields
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;

        await userRepository.update(user);
        return true;
    }
}

module.exports = new AuthService();
