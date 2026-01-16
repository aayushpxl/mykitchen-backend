const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

// @desc    Get Public Stats for About Us page
// @route   GET /api/general/stats
// @access  Public
const getPublicStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "normal" });
        const totalRecipes = await Recipe.countDocuments({ status: "approved" });
        const totalChallengesCompleted = await UserChallenge.countDocuments({ status: "completed" });

        // Fetch a few real user avatars for the community section
        const usersWithAvatars = await User.find({
            profilePic: { $exists: true, $ne: "" },
            role: "normal"
        })
            .select("profilePic username")
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRecipes,
                totalChallengesCompleted,
                communityAvatars: usersWithAvatars
            }
        });
    } catch (error) {
        console.error("Error fetching public stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getPublicStats
};
