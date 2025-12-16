const authService = require("../services/auth.service");
const { RegisterDTO, LoginDTO, UserResponseDTO } = require("../dtos/auth.dto");

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
      role: user.role
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
      role: user.role
    }
  });
};
