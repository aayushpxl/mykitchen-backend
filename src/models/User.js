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
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
