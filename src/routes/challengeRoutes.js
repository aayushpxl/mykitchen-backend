const express = require("express");
const router = express.Router();

const {
  createChallenge,
  getAllChallenges,
  getMyChallenges,
  joinChallenge,
  completeChallenge,
} = require("../controllers/challengeController");

const {
  authenticateUser,
  isAdmin
} = require("../middlewares/authMiddleware");

/* logged-in users */
router.get("/", authenticateUser, getAllChallenges);
router.get("/my", authenticateUser, getMyChallenges);
router.post("/:challengeId/join", authenticateUser, joinChallenge);
router.patch("/complete/:id", authenticateUser, completeChallenge);

/* admin only */
router.post("/", authenticateUser, isAdmin, createChallenge);

module.exports = router;
