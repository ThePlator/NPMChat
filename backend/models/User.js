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
      required: true,
      minlength: 6,
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