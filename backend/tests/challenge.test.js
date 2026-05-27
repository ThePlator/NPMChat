import request from "supertest"
import { describe, it, expect, beforeEach, vi } from "vitest"
import app from "../server.js"
import ChallengeRoom from "../models/ChallengeRoom.js"
import Problem from "../models/Problem.js"
import User from "../models/User.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

// Mock global fetch for Piston API calls
global.fetch = vi.fn()

describe("ChallengeRoom API Endpoints", () => {
  let user, problem, challenge, token

  beforeEach(async () => {
    await User.deleteMany({})
    await Problem.deleteMany({})
    await ChallengeRoom.deleteMany({})

    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    })

    token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", {
      expiresIn: "1h",
    })

    problem = await Problem.create({
      title: "Two Sum Test",
      slug: "two-sum-test",
      description: "Return indices",
      difficulty: "Easy",
      category: "Array",
      solutionTemplate: "function twoSum() {}",
    })

    challenge = await ChallengeRoom.create({
      title: "Initial Challenge",
      problemId: problem._id,
      creatorId: user._id,
      timeLimit: 15,
      endTime: new Date(Date.now() + 15 * 60000),
    })
  })

  it("POST /api/v1/challenges - should create a new challenge room", async () => {
    const res = await request(app)
      .post("/api/v1/challenges")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Speedrun Two Sum",
        problemId: problem._id,
        timeLimit: 10,
        allowedLanguages: ["javascript"],
      })

    expect(res.status).toBe(201)
    expect(res.body.title).toBe("Speedrun Two Sum")
    expect(res.body.timeLimit).toBe(10)
  })

  it("GET /api/v1/challenges - should return all public challenges", async () => {
    const res = await request(app).get("/api/v1/challenges")

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0].title).toBe("Initial Challenge")
  })

  it("GET /api/v1/challenges/:id - should return challenge details", async () => {
    const res = await request(app).get(`/api/v1/challenges/${challenge._id}`)

    expect(res.status).toBe(200)
    expect(res.body.title).toBe("Initial Challenge")
    expect(res.body.problemId.title).toBe("Two Sum Test")
  })

  it("POST /api/v1/challenges/:id/submit - should handle code submission and give badges", async () => {
    // Mock the Piston API response
    fetch.mockResolvedValueOnce({
      json: async () => ({
        run: {
          stdout: "Passed",
          stderr: "",
          code: 15,
        },
      }),
    })

    const res = await request(app)
      .post(`/api/v1/challenges/${challenge._id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "function twoSum() { return [0, 1] }",
        language: "javascript",
      })

    expect(res.status).toBe(200)
    expect(res.body.isCorrect).toBe(true)
    expect(res.body.submission.language).toBe("javascript")

    // Verify badge assignment in DB
    const updatedUser = await User.findById(user._id)
    expect(updatedUser.badges).toContain("first-blood")
    expect(updatedUser.badges).toContain("speedrunner")
  })

  // ---- NEW EDGE CASE TESTS ----

  it("POST /api/v1/challenges - should fail if problemId is missing or invalid", async () => {
    const res = await request(app)
      .post("/api/v1/challenges")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Missing Problem",
        timeLimit: 10,
        allowedLanguages: ["javascript"],
      })

    // If schema strictly requires problemId or if controller rejects it, it shouldn't be 201
    expect(res.status).not.toBe(201)
  })

  it("POST /api/v1/challenges/:id/submit - should fail if challenge has ended", async () => {
    // Create an expired challenge
    const expiredChallenge = await ChallengeRoom.create({
      title: "Expired Challenge",
      problemId: problem._id,
      creatorId: user._id,
      timeLimit: 1,
      startTime: new Date(Date.now() - 60000 * 5),
      endTime: new Date(Date.now() - 60000 * 4), // Ended 4 mins ago
    })

    const res = await request(app)
      .post(`/api/v1/challenges/${expiredChallenge._id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "function twoSum() {}",
        language: "javascript",
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe("Challenge has ended")
  })

  it("POST /api/v1/challenges/:id/submit - should handle piston execution errors gracefully", async () => {
    // Mock the Piston API response to simulate a compilation error
    fetch.mockResolvedValueOnce({
      json: async () => ({
        run: {
          stdout: "",
          stderr: "SyntaxError: Unexpected token",
          code: 1,
        },
      }),
    })

    const res = await request(app)
      .post(`/api/v1/challenges/${challenge._id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        code: "function twoSum() { syntax error }",
        language: "javascript",
      })

    expect(res.status).toBe(200) // Submission was successful, but code evaluation failed
    expect(res.body.isCorrect).toBe(false)
    expect(res.body.errorOutput).toContain("SyntaxError")
  })
})
