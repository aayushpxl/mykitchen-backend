const jwt = require("jsonwebtoken");
const User = require("../models/User");

// AUTHENTICATE USER
exports.authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
exports.isAdmin = (req, res, next) => {
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
exports.isUser = (req, res, next) => {
  if (req.user && req.user.role === "normal") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "User privilege required"
    });
  }
};
