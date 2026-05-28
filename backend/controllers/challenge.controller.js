import ChallengeRoom from "../models/ChallengeRoom.js"
import Problem from "../models/Problem.js"
import User from "../models/User.js"

const PISTON_URL = "https://emkc.org/api/v2/piston/execute"

const LANGUAGE_VERSIONS = {
  javascript: "18.15.0",
  python: "3.10.0",
  cpp: "10.2.0",
  java: "15.0.2",
  go: "1.16.2",
}

export const createChallenge = async (req, res) => {
  try {
    const { title, problemId, timeLimit, allowedLanguages, isPublic } = req.body

    const problem = await Problem.findById(problemId)
    if (!problem) return res.status(404).json({ error: "Problem not found" })

    const challenge = await ChallengeRoom.create({
      title,
      problemId,
      creatorId: req.user?._id, // if authenticated
      timeLimit: timeLimit || 30,
      allowedLanguages: allowedLanguages || [
        "javascript",
        "python",
        "cpp",
        "java",
        "go",
      ],
      isPublic: isPublic !== false,
      startTime: Date.now(),
      endTime: new Date(Date.now() + (timeLimit || 30) * 60000),
    })

    res.status(201).json(challenge)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getChallenges = async (req, res) => {
  try {
    const challenges = await ChallengeRoom.find({ isPublic: true })
      .populate("problemId", "title difficulty")
      .populate("creatorId", "name avatarUrl")
      .sort({ createdAt: -1 })
    res.status(200).json(challenges)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getChallengeById = async (req, res) => {
  try {
    const challenge = await ChallengeRoom.findById(req.params.id)
      .populate("problemId")
      .populate("creatorId", "name avatarUrl")
      .populate("submissions.userId", "name avatarUrl")
      .populate("participants", "name avatarUrl")
      .populate("spectators", "name avatarUrl")

    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" })
    res.status(200).json(challenge)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const submitSolution = async (req, res) => {
  try {
    const { id } = req.params
    const { code, language } = req.body
    const userId = req.user._id

    const challenge = await ChallengeRoom.findById(id).populate("problemId")
    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" })

    if (new Date() > challenge.endTime) {
      return res.status(400).json({ error: "Challenge has ended" })
    }

    const problem = challenge.problemId

    // Simple verification (assuming problem has a check/testcases setup)
    // In a real scenario, we inject the test cases into the code
    const testCode = `${code}\n\n// Run Test Cases\nconsole.log("Passed");` // Placeholder

    const response = await fetch(PISTON_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: LANGUAGE_VERSIONS[language] || "*",
        files: [{ content: testCode }],
      }),
    })

    const result = await response.json()
    const output = result.run?.stdout || ""
    const errorOutput = result.run?.stderr || ""

    const isCorrect = !errorOutput && output.includes("Passed") // Simplified evaluation
    const executionTimeMs = parseFloat(result.run?.code || 0) // Placeholder for execution time metric

    const submission = {
      userId,
      username: req.user.name,
      language,
      code,
      isCorrect,
      executionTimeMs,
      timeComplexity: "O(n)", // AI placeholder
      submittedAt: Date.now(),
    }

    challenge.submissions.push(submission)
    await challenge.save()

    // Assign Badges
    if (isCorrect) {
      const user = await User.findById(userId)
      let newBadges = []

      // 1. First Blood
      const correctSubmissions = challenge.submissions.filter(
        (s) => s.isCorrect,
      )
      if (correctSubmissions.length === 1) {
        if (!user.badges.includes("first-blood")) {
          user.badges.push("first-blood")
          newBadges.push("first-blood")
        }
      }

      // 2. Speedrunner (< 5 mins)
      const diffMins =
        (new Date(submission.submittedAt) - new Date(challenge.startTime)) /
        60000
      if (diffMins < 5) {
        if (!user.badges.includes("speedrunner")) {
          user.badges.push("speedrunner")
          newBadges.push("speedrunner")
        }
      }

      // 3. Polyglot (3+ languages)
      const userLangs = new Set(
        challenge.submissions
          .filter(
            (s) => s.userId.toString() === userId.toString() && s.isCorrect,
          )
          .map((s) => s.language),
      )
      if (userLangs.size >= 3) {
        if (!user.badges.includes("polyglot")) {
          user.badges.push("polyglot")
          newBadges.push("polyglot")
        }
      }

      if (newBadges.length > 0) {
        await user.save()
      }
    }

    res.status(200).json({ submission, isCorrect, output, errorOutput })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
