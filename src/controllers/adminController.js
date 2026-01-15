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

// @desc    Get Admin Dashboard Analytics (Time-series data)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
    try {
        // Last 7 days user growth
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            d.setHours(0, 0, 0, 0);
            return d;
        }).reverse();

        const userGrowth = await Promise.all(last7Days.map(async (date) => {
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const count = await User.countDocuments({
                createdAt: { $gte: date, $lt: nextDate },
                role: 'normal'
            });

            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                users: count
            };
        }));

        // Category distribution for recipes
        const categories = await Recipe.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const recipeStats = categories.map(cat => ({
            name: cat._id || 'Other',
            value: cat.count
        }));

        res.status(200).json({
            success: true,
            data: {
                userGrowth,
                recipeStats
            }
        });
    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Recent Activity Logs
// @route   GET /api/admin/recent-activity
// @access  Private/Admin
const getRecentActivity = async (req, res) => {
    try {
        // Fetch recent users
        const recentUsers = await User.find({ role: 'normal' })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('username profilePic createdAt');

        // Fetch recent recipes
        const recentRecipes = await Recipe.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'username profilePic');

        // Map into a unified activity feed
        const activities = [
            ...recentUsers.map(u => ({
                id: u._id,
                type: 'user_joined',
                title: 'New User Joined',
                description: `${u.username} created an account`,
                time: u.createdAt,
                user: {
                    username: u.username,
                    profilePic: u.profilePic
                }
            })),
            ...recentRecipes.map(r => ({
                id: r._id,
                type: 'recipe_added',
                title: 'New Recipe Added',
                description: `${r.createdBy?.username || 'Unknown User'} added "${r.title}"`,
                time: r.createdAt,
                user: {
                    username: r.createdBy?.username,
                    profilePic: r.createdBy?.profilePic
                },
                metadata: {
                    recipeId: r._id,
                    recipeTitle: r.title
                }
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

        res.status(200).json({
            success: true,
            data: activities
        });
    } catch (error) {
        console.error("Error fetching recent activity:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserById,
    getDashboardAnalytics,
    getRecentActivity
};
