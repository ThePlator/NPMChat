import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: false,  // OAuth users have no password
      minlength: 6,
      default: null,
    },

    name: {
      type: String,
      required: true,
    },

    avatarUrl: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

  
    googleId: {
      type: String,
      default: null,
      index: true,
    },

    githubId: {
      type: String,
      default: null,
      index: true,
    },

  
    refreshTokenHash: {
      type: String,
      default: null,
    },

    refreshTokenId: {
      type: String,
      default: null,
    },

  
    passwordResetTokenHash: {
      type: String,
      default: null,
      index: true,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
    },

    passwordResetUsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)

export default User