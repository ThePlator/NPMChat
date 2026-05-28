import { test, expect } from "@playwright/test"
import crypto from "crypto"

const TEST_JWT_SECRET = "github_actions_secret_123"

function base64UrlEncode(input: string | Buffer) {
  const buf = typeof input === "string" ? Buffer.from(input) : input
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
}

function signHs256(payload: Record<string, unknown>) {
  const header = { alg: "HS256", typ: "JWT" }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + 60 * 60 } // 1 hour

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const data = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac("sha256", TEST_JWT_SECRET)
    .update(data)
    .digest()

  return `${data}.${base64UrlEncode(signature)}`
}

test.describe("Message Flow", () => {
  test("should send a message successfully", async ({ page }) => {
    const testUserId = "507f191e810c19729de860ea"
    const friendId = "507f191e810c19729de860eb"
    const testToken = signHs256({
      id: testUserId,
      isGuest: true,
      name: "Me",
      roomId: "test-room",
    })

    // 1. Mock the auth refresh so we are logged in
    await page.route("**/api/v1/auth/refresh*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          json: {
            token: testToken,
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
    await page.route("**/api/v1/auth/check-auth*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            user: {
              id: testUserId,
              name: "Me",
              email: "me@example.com",
              avatarUrl: "",
              bio: "",
              isGuest: true,
              roomId: "test-room",
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
              _id: friendId,
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
              _id: friendId,
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
    await page.route(`**/api/v1/messages/${friendId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            {
              _id: "msg1",
              text: "Hi there",
              senderId: friendId,
              receiverId: testUserId,
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
    await page.route(`**/api/v1/messages/send/${friendId}`, async (route) => {
      if (route.request().method() === "POST") {
        const postData = JSON.parse(route.request().postData() || "{}")
        await route.fulfill({
          status: 201,
          json: {
            message: "Message sent successfully.",
            data: {
              _id: "msg2",
              text: postData.text,
              senderId: testUserId,
              receiverId: friendId,
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

    // Inject token before navigation to mimic proper hydration
    await page.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-access-token')
    })

    // Navigate to chat and wait for the users to load simultaneously
    const [sidebarResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("api/v1/messages") &&
          !response.url().includes("friend-id") &&
          response.request().method() === "GET" &&
          response.status() === 200,
        { timeout: 15000 }
      ),
      page.goto("/chat")
    ])

    // Wait for "Alice" to appear in the sidebar
    await expect(page.getByText("Alice").first()).toBeVisible({
      timeout: 10000,
    })

    // The app auto-selects the first user; wait for the conversation fetch to complete
    await historyResponsePromise

    // Verify chat history loaded
    await expect(page.getByText("Hi there")).toBeVisible({ timeout: 10000 })

    // Type a new message
    const input = page.getByPlaceholder("Type a message...")
    await input.fill("Hello Playwright!")

    // Click Send and wait for the network response simultaneously
    const [sendResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("api/v1/messages/send/friend-id") &&
          response.request().method() === "POST" &&
          response.status() === 201,
        { timeout: 10000 }
      ),
      page.getByRole("button", { name: "Send" }).click()
    ])

    // Verify the new message appears in the UI
    await expect(page.getByText("Hello Playwright!")).toBeVisible()
  })

  test("should sync missed messages on reconnect", async ({ page }) => {
    const testUserId = "507f191e810c19729de860ea"
    const friendId = "507f191e810c19729de860eb"
    const testToken = signHs256({
      id: testUserId,
      isGuest: true,
      name: "Me",
      roomId: "test-room",
    })

    // 1. Mock auth
    await page.route("**/api/v1/auth/refresh*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 200,
          json: { token: testToken },
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    await page.route("**/api/v1/auth/check-auth*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: {
            user: { id: testUserId, name: "Me", email: "me@example.com", avatarUrl: "", bio: "", isGuest: true, roomId: "test-room" },
          },
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 2. Mock sidebar users
    await page.route("**/api/v1/messages", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
        return
      }
      await route.fulfill({
        status: 200,
        json: {
          users: [{ _id: friendId, name: "Alice", email: "alice@example.com", avatarUrl: "", bio: "", status: "online" }],
          unseenMessages: { [friendId]: 2 },
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
          users: [{ _id: friendId, name: "Alice", email: "alice@example.com", avatarUrl: "", bio: "", status: "online" }],
          unseenMessages: { [friendId]: 2 },
        },
      })
    })

    // 3. Mock sync endpoint returning missed messages
    await page.route("**/api/v1/messages/sync", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            { _id: "sync-msg-1", text: "Missed message 1", senderId: friendId, receiverId: testUserId, createdAt: new Date().toISOString(), seen: false, delivered: true, status: "delivered" },
          ],
        })
      } else {
        await route.fulfill({ status: 405, json: { error: "Method Not Allowed" } })
      }
    })

    // 4. Mock the chat history (prevent unhandled request from auto-select)
    await page.route(`**/api/v1/messages/${friendId}`, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          json: [
            { _id: "sync-msg-1", text: "Missed message 1", senderId: friendId, receiverId: testUserId, createdAt: new Date().toISOString(), seen: false, delivered: true, status: "delivered" },
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
