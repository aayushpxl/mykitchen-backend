import mongoose from "mongoose";

const challengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    type: {
      type: String,
      enum: ["daily", "weekly"],
      required: true,
    },

    rewardPoints: { type: Number, default: 0 },
    badge: String,

    startDate: Date,
    endDate: Date,

    isActive: { type: Boolean, default: true },

    recipes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Challenge", challengeSchema);
