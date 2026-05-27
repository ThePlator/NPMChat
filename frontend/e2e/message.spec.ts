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

    // 2. Mock the sidebar users list (GET only)
    await page.route("**/api/v1/messages", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
        return
      }

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
    })
    await page.route("**/api/v1/messages/", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
        return
      }

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

    // 4. Mock the sync endpoint (returns no missed messages)
    await page.route("**/api/v1/messages/sync", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, json: [] })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 5. Mock the send message API (POST only)
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
    const sidebarResponsePromise = page.waitForResponse((response) => {
      const url = response.url()
      if (!url.includes("/api/v1/messages")) return false
      if (url.includes("/api/v1/messages/")) return false
      if (url.includes("/api/v1/messages/sync")) return false
      if (url.includes("friend-id")) return false
      return response.request().method() === "GET" && response.status() === 200
    })
    await sidebarResponsePromise

    // Wait for "Alice" to appear in the sidebar
    await expect(page.getByText("Alice").first()).toBeVisible({
      timeout: 10000,
    })

    // The app auto-selects the first user; wait for the conversation fetch to complete
    const historyResponsePromise = page.waitForResponse((response) => {
      const url = response.url()
      return (
        url.includes("/api/v1/messages/friend-id") &&
        response.request().method() === "GET" &&
        response.status() === 200
      )
    })
    await historyResponsePromise

    // Verify chat history loaded
    await expect(page.getByText("Hi there")).toBeVisible({ timeout: 10000 })

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

  test("should sync missed messages on reconnect", async ({ page }) => {
    // 1. Mock auth
    await page.route("**/api/v1/auth/refresh", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          json: { token: "mock-access-token" },
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    await page.route("**/api/v1/auth/check-auth", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            user: { id: "my-user-id", name: "Me", email: "me@example.com", avatarUrl: "", bio: "" },
          },
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 2. Mock sidebar users
    await page.route(/\/api\/v1\/messages\/?$/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            users: [{ _id: "friend-id", name: "Alice", email: "alice@example.com", avatarUrl: "", bio: "", status: "online" }],
            unseenMessages: { "friend-id": 2 },
          },
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 3. Mock sync endpoint returning missed messages
    await page.route("**/api/v1/messages/sync", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            { _id: "sync-msg-1", text: "Missed message 1", senderId: "friend-id", receiverId: "my-user-id", createdAt: new Date().toISOString(), seen: false, delivered: true, status: "delivered" },
          ],
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 4. Mock the chat history (prevent unhandled request from auto-select)
    await page.route("**/api/v1/messages/friend-id", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            { _id: "sync-msg-1", text: "Missed message 1", senderId: "friend-id", receiverId: "my-user-id", createdAt: new Date().toISOString(), seen: false, delivered: true, status: "delivered" },
          ],
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 5. Navigate to chat
    await page.goto("/chat")

    // 6. Wait for sync message to appear
    await expect(page.getByText("Missed message 1")).toBeVisible({ timeout: 10000 })
  })
})
