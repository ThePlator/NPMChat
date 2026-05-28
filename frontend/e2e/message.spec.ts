import { test, expect } from "@playwright/test"

test.describe("Message Flow", () => {
  test("should send a message successfully", async ({ page }) => {
    // 1. Mock the auth refresh so we are logged in
    await page.route("**/api/v1/auth/refresh", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          json: {
            token: "mock-access-token",
          },
        })
      } else {
        await route.fulfill({
          status: 405,
          json: { error: "Method Not Allowed" },
        })
      }
    })

    // Mock the auth check so we have user details
    await page.route("**/api/v1/auth/check-auth", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            user: {
              id: "my-user-id",
              name: "Me",
              email: "me@example.com",
              avatarUrl: "",
              bio: "",
            },
          },
        })
      } else {
        await route.fulfill({
          status: 405,
          json: { error: "Method Not Allowed" },
        })
      }
    })

    // 2. Mock the sidebar users (GET only)
    await page.route(/\/api\/v1\/messages\/?$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            users: [
              {
                _id: "friend-id",
                name: "Alice",
                email: "alice@example.com",
                avatarUrl: "",
                bio: "",
                status: "online",
              },
            ],
            unseenMessages: {},
          },
        })
      } else {
        await route.fulfill({
          status: 405,
          json: { error: "Method Not Allowed" },
        })
      }
    })

    // 3. Mock the chat history with the selected user (GET only)
    await page.route("**/api/v1/messages/friend-id", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            {
              _id: "msg1",
              text: "Hi there",
              senderId: "friend-id",
              receiverId: "my-user-id",
              createdAt: new Date().toISOString(),
            },
          ],
        })
      } else {
        await route.fulfill({
          status: 405,
          json: { error: "Method Not Allowed" },
        })
      }
    })

    // 4. Mock the send message API (POST only)
    await page.route("**/api/v1/messages/send/friend-id", async (route) => {
      if (route.request().method() === "POST") {
        const postData = JSON.parse(route.request().postData() || "{}")
        await route.fulfill({
          status: 201,
          json: {
            message: "Message sent successfully.",
            data: {
              _id: "msg2",
              text: postData.text,
              senderId: "my-user-id",
              receiverId: "friend-id",
              createdAt: new Date().toISOString(),
            },
          },
        })
      } else {
        await route.fulfill({
          status: 405,
          json: { error: "Method Not Allowed" },
        })
      }
    })

    // Navigate to chat
    await page.goto("/chat")

    // Wait for the users to load
    const sidebarResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("api/v1/messages") &&
        !response.url().includes("friend-id") &&
        response.request().method() === "GET" &&
        response.status() === 200,
    )
    await sidebarResponsePromise

    // Wait for "Alice" to appear in the sidebar
    await expect(page.getByText("Alice").first()).toBeVisible({
      timeout: 10000,
    })

    // Select "Alice" from sidebar
    await page.getByText("Alice").first().click()

    // Verify chat history loaded
    await expect(page.getByText("Hi there")).toBeVisible()

    // Type a new message
    const input = page.getByPlaceholder("Type a message...")
    await input.fill("Hello Playwright!")

    // Prepare to wait for the send message response
    const sendResponsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("api/v1/messages/send/friend-id") &&
        response.request().method() === "POST" &&
        response.status() === 201,
    )

    // Click Send
    await page.getByRole("button", { name: "Send" }).click()

    // Wait for the send message response
    await sendResponsePromise

    // Verify the new message appears in the UI
    await expect(page.getByText("Hello Playwright!")).toBeVisible()
  })
})
