const authService = require("../services/auth.service");
const { RegisterDTO, LoginDTO, UserResponseDTO } = require("../dtos/auth.dto");
const User = require("../models/User");

// REGISTER
exports.register = async (req, res) => {
  try {
    // 1. Validation (DTO)
    const validation = RegisterDTO.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validation.error.flatten()
      });
    }

    // 2. Service Call
    const newUser = await authService.register(validation.data);

    // 3. Response DTO
    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    // Handle Service Errors (Business Logic Errors)
    if (error.message.includes("exists")) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const validation = LoginDTO.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation Error",
        errors: validation.error.flatten()
      });
    }

    const { user, token } = await authService.login(validation.data);

    // Clean User Object for Response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      location: user.location,
      profilePic: user.profilePic,
      savedRecipes: user.savedRecipes || [],
      points: user.points || 0,
      badges: user.badges || [],
      interests: user.interests || []
    };

    res.json({
      user: userResponse,
      token
    });
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ME
exports.getMe = (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Not authenticated" });

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      location: user.location,
      profilePic: user.profilePic,
      savedRecipes: user.savedRecipes || [],
      points: user.points || 0,
      badges: user.badges || [],
      interests: user.interests || []
    }
  });
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email, phoneNumber, bio, location, interests } = req.body;

    console.log("Update profile request for user:", userId);
    console.log("Body fields:", { username, email, phoneNumber, bio, location });
    if (req.file) console.log("File uploaded:", req.file.filename);

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if new username/email is already taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) return res.status(400).json({ message: "Username already taken" });
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ message: "Email already taken" });
      user.email = email;
    }

    // Update other optional fields
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (interests !== undefined) {
      user.interests = Array.isArray(interests) ? interests : JSON.parse(interests);
    }

    // Update profile pic if file uploaded
    if (req.file) {
      user.profilePic = `/uploads/profile/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        location: user.location,
        location: user.location,
        profilePic: user.profilePic,
        savedRecipes: user.savedRecipes || [],
        points: user.points || 0,
        badges: user.badges || [],
        interests: user.interests || []
      }
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    await authService.forgotPassword(email);
    res.json({ success: true, message: "If an account exists, an OTP has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    await authService.verifyOTP(email, otp);
    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP, and new password are required" });
    }

    await authService.resetPassword(email, otp, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
