const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      default: "normal"
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    profilePic: {
      type: String
    },
    points: {
      type: Number,
      default: 0
    },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
    interests: [{ type: String }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
