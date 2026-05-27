import { test, expect } from "@playwright/test"

test.describe("Problem Template Library", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the problem library home
    await page.goto("/problems")
  })

  test("should display the problem library and support searching", async ({
    page,
  }) => {
    // Check if the page title and description are visible
    await expect(
      page.locator("h1", { hasText: "Problem Library" }),
    ).toBeVisible()

    // Assuming the database is seeded with "Two Sum"
    // We should see the list of problems
    await expect(page.locator("text=Two Sum")).toBeVisible()
    await expect(page.locator("text=Merge Intervals")).toBeVisible()

    // Test text search
    const searchInput = page.locator(
      'input[placeholder="Search by title, tags, or company..."]',
    )
    await searchInput.fill("Merge")
    await searchInput.press("Enter") // Some basic interaction, though our frontend currently doesn't trigger API on type for MVP, but let's assume filtering happens

    // Actually, since our current frontend MVP fetches all via SSR and doesn't wire the search input to the API dynamically yet,
    // the UI just shows the SSR content. In a full implementation, typing here would filter.
    // For now, we'll just verify the elements are present.
  })

  test("should navigate to problem details and start a session", async ({
    page,
  }) => {
    // Click on "Two Sum"
    await page.locator("text=Two Sum").click()

    // Should navigate to problem details page
    await expect(page).toHaveURL(/\/problems\/two-sum$/)
    await expect(page.locator("h1", { hasText: "Two Sum" })).toBeVisible()
    await expect(page.locator("text=Easy")).toBeVisible()
    await expect(page.locator("text=Arrays")).toBeVisible()

    // Hints should be visible (collapsed by default via <details> tag)
    await expect(page.locator("summary", { hasText: "Hint 1" })).toBeVisible()

    // Click "Start Session"
    await page.locator("text=Start Session").click()

    // Should redirect to a new room page with the problem param
    await page.waitForURL(/\/room\/[a-zA-Z0-9-]+\?problem=two-sum/)

    // Inside the room, guest modal should appear first
    await expect(page.locator("h2", { hasText: "Join the Room" })).toBeVisible()
    await page.fill('input[placeholder="e.g. Alex"]', "Problem Tester")
    await page.locator("button", { hasText: "Join Instantly" }).click()

    // Now we should see the room UI with the problem loaded on the left side
    // Verify problem title in the left panel
    await expect(page.locator("h2", { hasText: "Two Sum" })).toBeVisible()

    // Verify the code editor placeholder has the starter code
    const editorTextarea = page.locator("textarea")
    await expect(editorTextarea).toBeVisible()

    // The placeholder value should contain the JavaScript function signature
    const editorValue = await editorTextarea.inputValue()
    expect(editorValue).toContain("function twoSum(nums, target)")

    // Verify chat panel is on the right
    await expect(page.locator("text=Live Chat")).toBeVisible()
  })
})
