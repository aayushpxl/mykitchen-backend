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

    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

// Join challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

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



    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete challenge" });
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
