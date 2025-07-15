import mongoose from 'mongoose';

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
      default: '', // Default profile picture URL
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
