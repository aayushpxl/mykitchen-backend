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
      savedRecipes: user.savedRecipes || []
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
      savedRecipes: user.savedRecipes || []
    }
  });
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, email, phoneNumber, bio, location } = req.body;

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
        profilePic: user.profilePic,
        savedRecipes: user.savedRecipes || []
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
