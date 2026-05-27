import { describe, it, expect, beforeAll, afterEach } from "vitest"
import request from "supertest"
import express from "express"
import problemRouter from "../routes/problem.route.js"
import Problem from "../models/Problem.js"

// Setup Express app for testing
const app = express()
app.use(express.json())
app.use("/api/v1/problems", problemRouter)

describe("Problem Template Library API", () => {
  beforeAll(async () => {
    await Problem.deleteMany({})

    // Seed test problems
    await Problem.insertMany([
      {
        title: "Test Problem 1",
        slug: "test-problem-1",
        difficulty: "Easy",
        category: "Arrays",
        description: "Test description 1",
        hints: ["Hint 1"],
        starterCode: { javascript: "function test1() {}" },
        testCases: [{ input: "1", expectedOutput: "1" }],
        tags: ["Test", "Array"],
      },
      {
        title: "Test Problem 2",
        slug: "test-problem-2",
        difficulty: "Medium",
        category: "Linked Lists",
        description: "Test description 2",
        hints: ["Hint 2"],
        starterCode: { python: "def test2(): pass" },
        testCases: [{ input: "2", expectedOutput: "2" }],
        tags: ["Test", "List"],
      },
    ])
  })

  afterEach(async () => {
    // Keep data between tests
  })

  describe("GET /api/v1/problems", () => {
    it("should return a paginated list of problems", async () => {
      const response = await request(app).get("/api/v1/problems")

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("problems")
      expect(response.body).toHaveProperty("pagination")
      expect(response.body.problems.length).toBe(2)
      expect(response.body.problems[0]).toHaveProperty("title")
      expect(response.body.problems[0]).not.toHaveProperty("description") // Should only return list view fields
    })

    it("should filter problems by difficulty", async () => {
      const response = await request(app).get(
        "/api/v1/problems?difficulty=Medium",
      )

      expect(response.status).toBe(200)
      expect(response.body.problems.length).toBe(1)
      expect(response.body.problems[0].title).toBe("Test Problem 2")
    })

    it("should filter problems by category", async () => {
      const response = await request(app).get(
        "/api/v1/problems?category=Arrays",
      )

      expect(response.status).toBe(200)
      expect(response.body.problems.length).toBe(1)
      expect(response.body.problems[0].title).toBe("Test Problem 1")
    })

    it("should filter problems by text search", async () => {
      // Use a unique word that only exists in the second problem's indexed fields (e.g., its tags)
      const response = await request(app).get("/api/v1/problems?search=List")

      expect(response.status).toBe(200)
      expect(response.body.problems.length).toBe(1)
      expect(response.body.problems[0].title).toBe("Test Problem 2")
    })
  })

  describe("GET /api/v1/problems/:slug", () => {
    it("should return details for an existing problem", async () => {
      const response = await request(app).get("/api/v1/problems/test-problem-1")

      expect(response.status).toBe(200)
      expect(response.body.problem).toHaveProperty("title", "Test Problem 1")
      expect(response.body.problem).toHaveProperty(
        "description",
        "Test description 1",
      )
      expect(response.body.problem).toHaveProperty("hints")
      expect(response.body.problem.hints.length).toBe(1)
    })

    it("should return 404 for a non-existent problem", async () => {
      const response = await request(app).get("/api/v1/problems/does-not-exist")

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty("message", "Problem not found.")
    })
  })

  describe("GET /api/v1/problems/categories", () => {
    it("should return a list of unique categories", async () => {
      // Need to define a custom route handler for /categories to not conflict with /:slug
      // In the router, /categories is defined BEFORE /:slug, so it works
      const response = await request(app).get("/api/v1/problems/categories")

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty("categories")
      expect(response.body.categories).toContain("Arrays")
      expect(response.body.categories).toContain("Linked Lists")
    })
  })
})
