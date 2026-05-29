import { test, expect } from "@playwright/test"

test.describe("Pomodoro Timer in Room", () => {
  test("should display Pomodoro timer and allow starting focus session", async ({ page }) => {
    // 1. Intercept the users API to mock a logged-in user
    await page.route("**/api/v1/auth/check-auth", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          user: { id: "test-user-id", name: "TestUser", email: "test@example.com" },
        }),
      })
    })

    await page.route("**/api/v1/messages", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ users: [], unseenMessages: {} }),
      })
    })

    await page.goto("/room/test-room")

    // The timer should be visible, displaying "25:00"
    const timerText = page.locator("text=25:00")
    await expect(timerText).toBeVisible({ timeout: 10000 })

    const focusModeLabel = page.locator("text=Focus Session")
    await expect(focusModeLabel).toBeVisible()

    // Host should see Start Focus button
    const startFocusBtn = page.getByRole("button", { name: "Start Focus" })
    await expect(startFocusBtn).toBeVisible()

    // Click Start Focus
    await startFocusBtn.click()

    // Status should change to "Running"
    await expect(page.locator("text=Running")).toBeVisible()
    
    // Pause button should appear
    const pauseBtn = page.getByRole("button", { name: "Pause" })
    await expect(pauseBtn).toBeVisible()
    
    // Click Pause
    await pauseBtn.click()
    
    // Status should change to "Paused"
    await expect(page.locator("text=Paused")).toBeVisible()
    
    // Reset button should reset it
    const resetBtn = page.getByRole("button", { name: "Reset" })
    await resetBtn.click()
    
    // Status should change to "Idle"
    await expect(page.locator("text=Idle")).toBeVisible()
  })
})
