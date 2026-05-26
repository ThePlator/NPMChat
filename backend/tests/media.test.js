import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"
import Message from "../models/Message.js"

describe("Media Gallery Routes", () => {
  let user1Token = ""
  let user2Token = ""
  let user3Token = ""
  let user1Id = ""
  let user2Id = ""
  let user3Id = ""

  beforeAll(async () => {
    // Clear DB
    await User.deleteMany({})
    await Message.deleteMany({})

    // Create User 1
    const res1 = await request(app).post("/api/v1/auth/signup").send({
      email: "user1@example.com",
      password: "password123",
      name: "User One",
      captchaToken: "test-token",
    })
    user1Token = res1.body.token
    user1Id = res1.body.user.id

    // Create User 2
    const res2 = await request(app).post("/api/v1/auth/signup").send({
      email: "user2@example.com",
      password: "password123",
      name: "User Two",
      captchaToken: "test-token",
    })
    user2Token = res2.body.token
    user2Id = res2.body.user.id

    // Create User 3 (unrelated user)
    const res3 = await request(app).post("/api/v1/auth/signup").send({
      email: "user3@example.com",
      password: "password123",
      name: "User Three",
      captchaToken: "test-token",
    })
    user3Token = res3.body.token
    user3Id = res3.body.user.id

    // Create some messages with and without images
    await Message.create([
      { senderId: user1Id, receiverId: user2Id, text: "Hello", image: "" },
      {
        senderId: user1Id,
        receiverId: user2Id,
        text: "Look at this",
        image: "http://example.com/img1.jpg",
      },
      {
        senderId: user2Id,
        receiverId: user1Id,
        text: "Nice",
        image: "http://example.com/img2.jpg",
      },
      {
        senderId: user1Id,
        receiverId: user2Id,
        text: "Another one",
        image: "http://example.com/img3.jpg",
      },
      {
        senderId: user1Id,
        receiverId: user3Id,
        text: "Private",
        image: "http://example.com/img_private.jpg",
      },
    ])
  })

  it("GET /api/v1/messages/media/:userId - should fetch only media messages between users", async () => {
    const res = await request(app)
      .get(`/api/v1/messages/media/${user2Id}`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res.status).toBe(200)
    expect(res.body.messages.length).toBe(3)
    expect(res.body.totalMedia).toBe(3)
    res.body.messages.forEach((msg) => {
      expect(msg.image).not.toBe("")
      expect([user1Id, user2Id]).toContain(msg.senderId)
      expect([user1Id, user2Id]).toContain(msg.receiverId)
    })
  })

  it("GET /api/v1/messages/media/:userId - should handle pagination", async () => {
    const res = await request(app)
      .get(`/api/v1/messages/media/${user2Id}?limit=2&page=1`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res.status).toBe(200)
    expect(res.body.messages.length).toBe(2)
    expect(res.body.totalMedia).toBe(3)
    expect(res.body.totalPages).toBe(2)
    expect(res.body.currentPage).toBe(1)

    const res2 = await request(app)
      .get(`/api/v1/messages/media/${user2Id}?limit=2&page=2`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res2.status).toBe(200)
    expect(res2.body.messages.length).toBe(1)
    expect(res2.body.currentPage).toBe(2)
  })

  it("GET /api/v1/messages/media/:userId - should not return media from unrelated conversations", async () => {
    const res = await request(app)
      .get(`/api/v1/messages/media/${user2Id}`)
      .set("Authorization", `Bearer ${user1Token}`)

    const privateImages = res.body.messages.filter(
      (msg) => msg.image === "http://example.com/img_private.jpg",
    )
    expect(privateImages.length).toBe(0)
  })

  it("GET /api/v1/messages/media/:userId - should reject unauthorized access (no token)", async () => {
    const res = await request(app).get(`/api/v1/messages/media/${user2Id}`)

    expect(res.status).toBe(401)
  })
})
