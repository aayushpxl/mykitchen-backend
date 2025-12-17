const jwt = require("jsonwebtoken");
const User = require("../models/User");

// OPTIONAL AUTH (Guest or User)
const optionalAuth = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    // If token invalid, treat as guest
    req.user = null;
    next();
  }
};

// AUTHENTICATE USER (Strict)
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    req.user = user; // attach user
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed"
    });
  }
};

// ADMIN ONLY
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Admin privilege required"
    });
  }
};

// NORMAL USER ONLY
const isUser = (req, res, next) => {
  if (req.user && req.user.role === "normal") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "User privilege required"
    });
  }
};

module.exports = { authenticateUser, optionalAuth, isAdmin, isUser };
