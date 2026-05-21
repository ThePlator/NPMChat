import mongoose from "mongoose"

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)

    console.log("MongoDB connected successfully")
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    if (process.env.NODE_ENV !== "test" && process.env.CI !== "true") {
      process.exit(1) // Exit the process with failure
    }
  }
}
