const mongoose = require("mongoose");

const userChallengeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Challenge",
      required: true
    },

    status: {
      type: String,
      enum: ["joined", "completed"],
      default: "joined"
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: Date
      }
    ],

    points: {
      type: Number,
      default: 0
    },

    completedAt: {
      type: Date
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("UserChallenge", userChallengeSchema);
