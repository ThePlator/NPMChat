import { test, expect } from "@playwright/test"

test.describe("Public Coding Challenges Feature", () => {
  // We need to bypass auth or assume it's seeded. For this e2e, we'll mock the responses
  // to isolate the frontend logic of the challenge rooms.

  test.beforeEach(async ({ page }) => {
    // Mock auth API
    await page.route("**/api/v1/auth/check-auth", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: {
            id: "test-user-1",
            name: "E2E User",
            email: "e2e@example.com",
          },
        }),
      })
    })

    // Mock challenges API
    await page.route("**/api/v1/challenges", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              _id: "test-challenge-1",
              title: "Weekly Speedrun: Two Sum",
              timeLimit: 15,
              problemId: { title: "Two Sum" },
              participants: ["user1", "user2"],
            },
          ]),
        })
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ _id: "new-challenge-99" }),
        })
      }
    })

    // Mock problems API for the Create Challenge page
    await page.route("**/api/v1/problems", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          { _id: "prob1", title: "Two Sum" },
          { _id: "prob2", title: "Valid Anagram" },
        ]),
      })
    })

    // Mock individual challenge room API
    await page.route("**/api/v1/challenges/*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            _id: "test-challenge-1",
            title: "Weekly Speedrun: Two Sum",
            timeLimit: 15,
            problemId: {
              title: "Two Sum",
              description: "Given an array of integers...",
              solutionTemplate: "function twoSum(nums, target) {\n\n}",
            },
            allowedLanguages: ["javascript", "python"],
            submissions: [
              {
                userId: "user2",
                username: "Alice",
                language: "javascript",
                isCorrect: true,
                executionTimeMs: 42,
                submittedAt: new Date().toISOString(),
              },
            ],
          }),
        })
      }
    })
  })

  test("should display active challenges on the challenges list page", async ({
    page,
  }) => {
    await page.goto("/challenges")

    // Check header
    await expect(page.getByText("Public Coding Challenges")).toBeVisible()

    // Check challenge card
    await expect(page.getByText("Weekly Speedrun: Two Sum")).toBeVisible()
    await expect(page.getByText("Problem: Two Sum")).toBeVisible()
    await expect(page.getByText("15 mins")).toBeVisible()
  })

  test("should navigate to create challenge form and submit", async ({
    page,
  }) => {
    await page.goto("/challenges")

    // Click create button
    await page.getByRole("button", { name: "Create Challenge" }).click()
    await expect(page).toHaveURL(/\/challenges\/new/)

    // Fill form
    await page.fill(
      "input[placeholder='e.g. Weekly Speedrun']",
      "My Custom Room",
    )
    await page.selectOption("select", "prob2") // Valid Anagram
    await page.fill("input[type='number']", "20")

    // Submit form
    await page.getByRole("button", { name: "Start Challenge" }).click()

    // Should navigate to the new room (mocked response returns id: new-challenge-99)
    await expect(page).toHaveURL(/\/challenges\/new-challenge-99/)
  })

  test("should render the challenge room with leaderboard and spectator mode", async ({
    page,
  }) => {
    // Go to room as spectator
    await page.goto("/challenges/test-challenge-1?spectate=true")

    // Check room title
    await expect(
      page.getByRole("heading", { name: "Weekly Speedrun: Two Sum" }),
    ).toBeVisible()

    // Check spectator overlay
    await expect(
      page.getByText("You are spectating. You can only view the leaderboard."),
    ).toBeVisible()

    // Check Leaderboard
    await expect(page.getByText("🏆 Live Leaderboard")).toBeVisible()
    await expect(page.getByText("Alice")).toBeVisible()
    await expect(page.getByText("Passed")).toBeVisible()
    await expect(page.getByText("42ms")).toBeVisible()
  })
})
