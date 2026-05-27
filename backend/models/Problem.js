import mongoose from "mongoose"

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
    },
    category: {
      type: String,
      required: true,
      trim: true, // e.g. "Arrays", "Dynamic Programming"
    },
    description: {
      type: String,
      required: true, // Markdown format
    },
    hints: [
      {
        type: String, // Step-by-step hints
      },
    ],
    starterCode: {
      // Key is the language (e.g., 'javascript', 'python', 'cpp'), value is the code stub
      type: Map,
      of: String,
      default: {},
    },
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false }, // Hidden tests for final evaluation
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    published: {
      type: Boolean,
      default: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Null if official problem
      default: null,
    },
  },
  { timestamps: true },
)

// Add text indexing for search
problemSchema.index({ title: "text", category: "text", tags: "text" })

export default mongoose.model("Problem", problemSchema)
