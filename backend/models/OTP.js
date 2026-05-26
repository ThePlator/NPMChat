import mongoose from "mongoose"

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // 5 minutes in seconds (TTL index)
    },
  },
  { timestamps: false }
)

const OTP = mongoose.model("OTP", otpSchema)
export default OTP
