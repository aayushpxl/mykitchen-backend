const express = require("express");
const {
  createChallenge,
  getAllChallengesAdmin,
  updateChallenge,
  deleteChallenge,
  getActiveChallenges,
  joinChallenge,
  getMyChallenges,
  completeChallenge,
  getChallengeById,
  unjoinChallenge,
  getLeaderboard,
  completeChallengeByRecipe,
  getChallengeParticipants,
  getChallengeLockStatus
} = require("../controllers/challengeController.js");

const { authenticateUser, isAdmin, isUser } = require("../middlewares/authMiddleware.js");

const router = express.Router();

/* ADMIN (Protected + Admin Role) */
router.post("/", authenticateUser, isAdmin, createChallenge);
router.get("/admin/all", authenticateUser, isAdmin, getAllChallengesAdmin);
router.put("/:id", authenticateUser, isAdmin, updateChallenge);
router.delete("/:id", authenticateUser, isAdmin, deleteChallenge);

/* USER */
router.get("/", getActiveChallenges);
router.get("/leaderboard", getLeaderboard); // Public or private? Let's keep public
router.post("/:challengeId/join", authenticateUser, joinChallenge); // Added auth middleware to be safe
router.delete("/:challengeId/unjoin", authenticateUser, unjoinChallenge);
router.get("/my", authenticateUser, getMyChallenges);
router.put("/complete/:id", authenticateUser, completeChallenge);
router.post("/complete-by-recipe", authenticateUser, completeChallengeByRecipe);
router.get("/:id/participants", authenticateUser, isAdmin, getChallengeParticipants); // Admin only
router.get("/recipe/:recipeId/lock-status", authenticateUser, getChallengeLockStatus); // Public/Member check
router.get("/:id", getChallengeById);

module.exports = router;

