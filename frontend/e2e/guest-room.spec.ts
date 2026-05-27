import { test, expect } from "@playwright/test"

test.describe("Viral Guest Rooms", () => {
  const ROOM_ID = "test-viral-room"

  test("should allow a guest to join without an account", async ({ page }) => {
    // Navigate to the room directly
    await page.goto(`/room/${ROOM_ID}`)

    // Should see the Guest Login Modal
    await expect(page.locator("h2", { hasText: "Join the Room" })).toBeVisible()
    await expect(page.locator("text=No account required")).toBeVisible()

    // Fill in guest name
    await page.fill('input[placeholder="e.g. Alex"]', "E2E Guest")

    // Check if Join button is enabled and click it
    const joinBtn = page.locator("button", { hasText: "Join Instantly" })
    await expect(joinBtn).toBeEnabled()
    await joinBtn.click()

    // Should drop into the room UI
    await expect(page.locator(`text=Room: ${ROOM_ID}`)).toBeVisible()
    await expect(page.locator("text=Live Chat")).toBeVisible()

    // Verify Guest badge appears next to name in sidebar
    await expect(page.locator("text=E2E Guest")).toBeVisible()
    await expect(page.locator("text=Guest").first()).toBeVisible()

    // Test sending an ephemeral message (wait for socket connect)
    await page.waitForTimeout(1000)
    await page.fill(
      'input[placeholder="Type a message..."]',
      "Hello from E2E test!",
    )
    await page.locator("button", { hasText: "Send" }).click()

    // Message should appear in chat
    await expect(page.locator("text=Hello from E2E test!")).toBeVisible()

    // Test Leave Room behavior for guests (should show Upsell modal)
    await page.locator("button", { hasText: "Leave Room" }).click()

    // Upsell modal check
    await expect(
      page.locator("h2", { hasText: "Save your work!" }),
    ).toBeVisible()
    await expect(
      page.locator("button", { hasText: "Create a Free Account" }),
    ).toBeVisible()

    // Click leave without saving
    await page.locator("button", { hasText: "Leave without saving" }).click()

    // Should be redirected to home
    await expect(page).toHaveURL("/")
  })
})
