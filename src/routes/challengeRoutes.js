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
  getChallengeById
} = require("../controllers/challengeController.js");

const { authenticateUser, isAdmin, isUser } = require("../middlewares/authMiddleware.js");

const router = express.Router();

/* ADMIN */
router.post("/",  authenticateUser, createChallenge);
router.get("/admin", authenticateUser, getAllChallengesAdmin);
router.put("/:id",  authenticateUser, updateChallenge);
router.delete("/:id",  authenticateUser, deleteChallenge);

/* USER */
router.get("/", getActiveChallenges);
router.post("/:challengeId/join", joinChallenge);
router.get("/my", authenticateUser, getMyChallenges);
router.put("/complete/:id", authenticateUser, completeChallenge);
router.get("/:id", getChallengeById);

module.exports = router;
