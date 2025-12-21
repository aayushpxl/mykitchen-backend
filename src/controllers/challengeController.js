import Challenge from "../models/Challenge.js";
import UserChallenge from "../models/UserChallenge.js";

/* ADMIN */
export const createChallenge = async (req, res) => {
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

export const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch challenges" });
  }
};

/* USER */
export const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;

    const alreadyJoined = await UserChallenge.findOne({
      user: req.user.id,
      challenge: challengeId
    });

    if (alreadyJoined) {
      return res.status(400).json({ message: "Already joined" });
    }

    const join = await UserChallenge.create({
      user: req.user.id,
      challenge: challengeId
    });

    res.status(201).json(join);
  } catch (error) {
    res.status(500).json({ message: "Failed to join challenge" });
  }
};

export const getMyChallenges = async (req, res) => {
  try {
    const myChallenges = await UserChallenge.find({
      user: req.user.id
    }).populate("challenge");

    res.json(myChallenges);
  } catch (error) {
    res.status(500).json({ message: "Failed to load user challenges" });
  }
};

export const completeChallenge = async (req, res) => {
  try {
    const { id } = req.params;

    const challenge = await UserChallenge.findById(id);
    if (!challenge) return res.status(404).json({ message: "Not found" });

    challenge.status = "completed";
    challenge.progress = 100;
    await challenge.save();

    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: "Failed to complete challenge" });
  }
};
