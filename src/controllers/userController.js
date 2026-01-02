const User = require("../models/User");

// @desc    Search users by username
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        // Search for users with username matching the query (case-insensitive)
        // excluding password and sensitive info
        const users = await User.find({
            username: { $regex: query, $options: "i" }
        })
            .select("_id username profilePic")
            .limit(10); // Limit results to 10

        res.json(users);
    } catch (error) {
        console.error("Search Users Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
