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
      required: false,  
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
  },
  { timestamps: true },
)

const User = mongoose.model("User", userSchema)

export default User