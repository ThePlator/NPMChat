import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"

describe("User Profile Routes", () => {
  let testToken = ""
  let userId = ""

  beforeAll(async () => {
    await User.deleteMany({})

    const res = await request(app).post("/api/v1/auth/signup").send({
      email: "profileuser@example.com",
      password: "password123",
      name: "Profile User",
      captchaToken: "test-token",
    })
    testToken = res.body.token
    userId = res.body.user.id
  })

  it("PUT /api/v1/auth/update-profile - should update user profile without avatar", async () => {
    const res = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        name: "Updated Name",
        bio: "New Bio",
      })

    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe("Updated Name")
    expect(res.body.user.bio).toBe("New Bio")
  })

  it("PUT /api/v1/auth/update-profile - should update user profile with avatar", async () => {
    const res = await request(app)
      .put("/api/v1/auth/update-profile")
      .set("Authorization", `Bearer ${testToken}`)
      .send({
        name: "Another Name",
        avatarUrl: "data:image/png;base64,mockbase64data",
        bio: "Another Bio",
      })

    expect(res.status).toBe(200)
    expect(res.body.user.name).toBe("Another Name")
    expect(res.body.user.avatarUrl).toBe(
      "https://mock.cloudinary.com/image.png",
    ) // Mocked in setup.js
    expect(res.body.user.bio).toBe("Another Bio")
  })
})
