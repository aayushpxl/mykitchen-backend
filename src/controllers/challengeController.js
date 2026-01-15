const Challenge = require("../models/Challenge");
const UserChallenge = require("../models/UserChallenge");

/* ===========================
   ADMIN CONTROLLERS
=========================== */

// Create challenge
exports.createChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to create challenge" });
  }
};

// Get all challenges (admin)
exports.getAllChallengesAdmin = async (req, res) => {
  try {
    const challenges = await Challenge.find().populate("recipe");
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

// Update challenge
exports.updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to update challenge" });
  }
};

// Delete challenge
exports.deleteChallenge = async (req, res) => {
  try {
    await Challenge.findByIdAndDelete(req.params.id);
    res.json({ message: "Challenge deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete challenge" });
  }
};



// Public / logged-in users
exports.getActiveChallenges = async (req, res) => {
  try {
    // We removed the startDate/endDate restriction so you can see upcoming challenges
    const challenges = await Challenge.find({
      isActive: true
    }).populate("recipe");

    console.log(`[getActiveChallenges] Found ${challenges.length} active challenges`);
    res.json(challenges);
  } catch (error) {
    console.error("[getActiveChallenges] Error:", error);
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

// Join challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    // Check if challenge exists and is not expired
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    if (challenge.endDate && new Date(challenge.endDate) < new Date()) {
      return res.status(400).json({ message: "This challenge has expired and cannot be joined." });
    }

    const join = await UserChallenge.create({
      user: req.user.id,
      challenge: challengeId
    });

    res.status(201).json(join);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Already joined" });
    }
    res.status(500).json({ message: "Failed to join challenge" });
  }
};

// Get logged-in user's challenges
exports.getMyChallenges = async (req, res) => {
  try {
    const myChallenges = await UserChallenge.find({
      user: req.user.id
    }).populate({
      path: "challenge",
      populate: { path: "recipe" }
    });

    res.json(myChallenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to load user challenges" });
  }
};

// Complete challenge
exports.completeChallenge = async (req, res) => {
  try {
    const challenge = await UserChallenge.findById(req.params.id)
      .populate("challenge");

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    if (challenge.status === "completed") {
      return res.status(400).json({ message: "Already completed" });
    }

    challenge.status = "completed";
    challenge.progress = 100;
    challenge.completedAt = new Date();

    await challenge.save();

    // Reward the user
    const fullChallenge = await Challenge.findById(challenge.challenge);
    if (fullChallenge) {
      const User = require("../models/User");
      const user = await User.findById(req.user.id);

      // Add points
      user.points = (user.points || 0) + fullChallenge.points;

      // Add badge if not already earned (simple check by name for now)
      const hasBadge = user.badges.some(b => b.name === fullChallenge.badge.name);
      if (!hasBadge && fullChallenge.badge && fullChallenge.badge.name) {
        user.badges.push({
          name: fullChallenge.badge.name,
          icon: fullChallenge.badge.icon || '🏆',
          earnedAt: new Date()
        });
      }

      await user.save();
    }

    res.json(challenge);
  } catch (error) {
    console.error("Complete challenge error:", error);
    res.status(500).json({ message: "Failed to complete challenge" });
  }
};

// Complete challenge by recipe ID (triggered when cooking is done)
exports.completeChallengeByRecipe = async (req, res) => {
  try {
    const { recipeId } = req.body;

    // Find all joined challenges for this user
    const userChallenges = await UserChallenge.find({
      user: req.user.id,
      status: "joined"
    }).populate("challenge");

    // Find the one that matches the recipe
    const match = userChallenges.find(uc => uc.challenge.recipe.toString() === recipeId);

    if (!match) {
      return res.json({ message: "No active challenge for this recipe" }); // Not an error, just nothing to do
    }

    // Reuse complete logic (can refactor later to shared function, but for now invoke via internal call or duplicate logic)
    // Duplicating logic for safety and speed to avoid breaking existing completeChallenge
    match.status = "completed";
    match.progress = 100;
    match.completedAt = new Date();
    await match.save();

    const fullChallenge = match.challenge; // Already populated
    if (fullChallenge) {
      const User = require("../models/User");
      const user = await User.findById(req.user.id);
      user.points = (user.points || 0) + fullChallenge.points;

      const hasBadge = user.badges.some(b => b.name === fullChallenge.badge.name);
      if (!hasBadge && fullChallenge.badge && fullChallenge.badge.name) {
        user.badges.push({
          name: fullChallenge.badge.name,
          icon: fullChallenge.badge.icon || '🏆',
          earnedAt: new Date()
        });
      }
      await user.save();
    }

    res.json({ success: true, message: "Challenge Completed!", earnedPoints: fullChallenge.points, badge: fullChallenge.badge });

  } catch (error) {
    console.error("Complete by recipe error:", error);
    res.status(500).json({ message: "Failed to check challenge completion" });
  }
};
// Add this to challengeController.js
exports.getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate("recipe") // Vital: This gets the instructions for the detail page
      .populate("createdBy", "username");

    if (!challenge) {
      return res.status(404).json({ message: "Challenge not found" });
    }

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenge details" });
  }
};


// Unjoin challenge
// Unjoin challenge / Remove from list (Supports deleting via UserChallenge ID or Challenge ID)
exports.unjoinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params; // This parameter name comes from route /:challengeId/unjoin usually, but we might pass UserChallenge ID here.

    // Try to delete by UserChallenge ID first (most specific)
    const byId = await UserChallenge.findOneAndDelete({
      _id: challengeId,
      user: req.user.id
    });

    if (byId) {
      return res.json({ message: "Challenge removed successfully" });
    }

    // Fallback: Delete by Challenge ID (if frontend passed challenge ID)
    const byChallengeId = await UserChallenge.findOneAndDelete({
      user: req.user.id,
      challenge: challengeId
    });

    if (byChallengeId) {
      return res.json({ message: "Challenge unjoined successfully" });
    }

    res.status(404).json({ message: "Challenge entry not found" });
  } catch (error) {
    console.error("Unjoin error:", error);
    res.status(500).json({ message: "Failed to unjoin challenge" });
  }
};

// Get Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const User = require("../models/User");
    // Top 10 users by points
    const leaders = await User.find({ points: { $gt: 0 } })
      .sort({ points: -1 })
      .limit(10)
      .select("username profilePic points badges");

    res.json(leaders);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Failed to fetch leaderboard" });
  }
};

// Get participants for a challenge
exports.getChallengeParticipants = async (req, res) => {
  try {
    const UserChallenge = require("../models/UserChallenge");
    const participants = await UserChallenge.find({ challenge: req.params.id })
      .populate("user", "username profilePic points email")
      .sort("-createdAt");

    res.json(participants);
  } catch (error) {
    console.error("Participants error:", error);
    res.status(500).json({ message: "Failed to fetch participants" });
  }
};

// Check if recipe is locked (belongs to challenge user hasn't joined)
exports.getChallengeLockStatus = async (req, res) => {
  try {
    const { recipeId } = req.params;

    // Check if any active challenge uses this recipe
    const challenge = await Challenge.findOne({
      recipe: recipeId,
      isActive: true
    });

    if (!challenge) {
      // No active challenge for this recipe, so it's unlocked
      return res.json({ locked: false, hasChallenge: false });
    }

    // If challenge exists, check if user joined
    const UserChallenge = require("../models/UserChallenge");
    const joined = await UserChallenge.findOne({
      user: req.user.id,
      challenge: challenge._id,
      status: { $in: ["joined", "completed"] }
    });

    if (joined) {
      return res.json({ locked: false, hasChallenge: true, status: "joined" });
    }

    // Challenge exists but user not joined -> Locked
    res.json({
      locked: true,
      hasChallenge: true,
      challengeId: challenge._id,
      challengeTitle: challenge.title
    });

  } catch (error) {
    console.error("Lock status error:", error);
    res.status(500).json({ message: "Failed to check lock status" });
  }
};

