const User = require("../models/User");
const Recipe = require("../models/Recipe");
const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "normal" });
        const totalRecipes = await Recipe.countDocuments();
        const totalChallenges = await Challenge.countDocuments();

        // Active challenges (endDate is in the future)
        const activeChallenges = await Challenge.countDocuments({
            endDate: { $gte: new Date() },
            isActive: true
        });

        const completedChallenges = await Challenge.countDocuments({
            endDate: { $lt: new Date() }
        });

        const pendingRecipes = await Recipe.countDocuments({ status: 'pending' });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalRecipes,
                totalChallenges,
                activeChallenges,
                completedChallenges,
                pendingRecipes
            },
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');

        // Enhance with challenge stats
        const userStats = await Promise.all(users.map(async (user) => {
            const completedChallenges = await UserChallenge.countDocuments({
                user: user._id,
                status: 'completed'
            });
            const joinedChallenges = await UserChallenge.countDocuments({
                user: user._id
            });

            // Calculate total points
            const challenges = await UserChallenge.find({ user: user._id });
            const totalPoints = challenges.reduce((acc, curr) => acc + (curr.points || 0), 0);

            return {
                ...user.toObject(),
                completedChallenges,
                joinedChallenges,
                totalPoints
            };
        }));

        res.json(userStats);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get User By ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const completedChallenges = await UserChallenge.countDocuments({
            user: user._id,
            status: 'completed'
        });
        const joinedChallenges = await UserChallenge.countDocuments({
            user: user._id
        });

        const publishedRecipes = await Recipe.countDocuments({
            createdBy: user._id,
            status: 'approved'
        });

        // Calculate total points
        const challenges = await UserChallenge.find({ user: user._id });
        const totalPoints = challenges.reduce((acc, curr) => acc + (curr.points || 0), 0);

        const userWithStats = {
            ...user.toObject(),
            completedChallenges,
            joinedChallenges,
            publishedRecipes,
            totalPoints
        };

        res.json(userWithStats);
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserById
};
