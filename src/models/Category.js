import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    rewardPoints: {
      type: Number,
      default: 0,
    },

    badge: {
      type: String, // badge name or image url
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", challengeSchema);
