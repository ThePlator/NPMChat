import mongoose from "mongoose"

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: String,
  language: String,
  code: String,
  isCorrect: Boolean,
  executionTimeMs: Number,
  timeComplexity: String,
  submittedAt: { type: Date, default: Date.now },
})

const challengeRoomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timeLimit: { type: Number, required: true, default: 30 }, // in minutes
    allowedLanguages: [
      { type: String, default: ["javascript", "python", "cpp", "java", "go"] },
    ],
    isPublic: { type: Boolean, default: true },
    isAutomatedWeekly: { type: Boolean, default: false },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    spectators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    submissions: [submissionSchema],
  },
  { timestamps: true },
)

export default mongoose.model("ChallengeRoom", challengeRoomSchema)
