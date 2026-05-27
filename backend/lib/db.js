import mongoose from "mongoose"
export const connectDB = async () => {
  try {
    if (process.env.NODE_ENV === "test") {
      await mongoose.connect(
        process.env.MONGODB_URI || "mongodb://localhost:27017/test",
      )
      console.log("MongoDB connected successfully")
      return
    }

    if (process.env.MONGODB_URI) {
      try {
        console.log("Connecting to MONGODB_URI...")
        // 3 seconds timeout to fail fast if MongoDB service is not running locally
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 3000,
        })
        console.log("MongoDB connected successfully")
        return
      } catch (err) {
        console.log(
          "Local MongoDB server is not running or connection timed out. Falling back to in-memory DB...",
        )
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log("Spinning up MongoMemoryServer for development...")
      const { MongoMemoryServer } = await import("mongodb-memory-server")
      const mongoServer = await MongoMemoryServer.create()
      const uri = mongoServer.getUri()
      await mongoose.connect(uri)
      console.log("In-memory MongoDB started and connected successfully")
    } else {
      throw new Error("No MongoDB connection URI provided.")
    }

    // Auto-seed problems if empty (useful for memory server or fresh DBs)
    try {
      const Problem = (await import("../models/Problem.js")).default
      const count = await Problem.countDocuments()
      if (count === 0) {
        console.log("No problems found in DB. Auto-seeding initial library...")
        const { problems } = await import("../scripts/seedProblems.js")
        await Problem.insertMany(problems)
        console.log("Successfully seeded problem library!")
      }
    } catch (seedErr) {
      console.error("Failed to auto-seed problems:", seedErr)
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error)
    if (process.env.NODE_ENV !== "test" && process.env.CI !== "true") {
      process.exit(1) // Exit the process with failure
    }
  }
}
