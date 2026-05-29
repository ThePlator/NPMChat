import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"
import Message from "../models/Message.js"
import jwt from "jsonwebtoken"

describe("Message Routes", () => {
  let user1Token = ""
  let user2Token = ""
  let user1Id = ""
  let user2Id = ""
  let messageId = ""

  beforeAll(async () => {
    // Clear DB specifically for this suite
    await User.deleteMany({})
    await Message.deleteMany({})

    // Create User 1
    const emailVerificationToken1 = jwt.sign(
      { email: "user1@example.com", type: "email-verification" },
      process.env.JWT_SECRET || "test-secret",
    )
    const res1 = await request(app).post("/api/v1/auth/signup").send({
      email: "user1@example.com",
      password: "password123",
      name: "User One",
      emailVerificationToken: emailVerificationToken1,
    })
    user1Token = res1.body.token
    user1Id = res1.body.user.id

    // Create User 2
    const emailVerificationToken2 = jwt.sign(
      { email: "user2@example.com", type: "email-verification" },
      process.env.JWT_SECRET || "test-secret",
    )
    const res2 = await request(app).post("/api/v1/auth/signup").send({
      email: "user2@example.com",
      password: "password123",
      name: "User Two",
      emailVerificationToken: emailVerificationToken2,
    })
    user2Token = res2.body.token
    user2Id = res2.body.user.id
  })

  it("POST /api/v1/messages/send/:id - should send a message to another user", async () => {
    const res = await request(app)
      .post(`/api/v1/messages/send/${user2Id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ text: "Hello User Two!" })

    expect(res.status).toBe(201)
    expect(res.body.data.text).toBe("Hello User Two!")
    expect(res.body.data.senderId).toBe(user1Id)
    expect(res.body.data.receiverId).toBe(user2Id)
    messageId = res.body.data._id
  })

  it("GET /api/v1/messages/:id - should fetch conversation messages", async () => {
    const res = await request(app)
      .get(`/api/v1/messages/${user1Id}`)
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(1)
    expect(res.body[0].text).toBe("Hello User Two!")
  })

  it("GET /api/v1/messages - should get users for sidebar and not leak sensitive fields", async () => {
    const res = await request(app)
      .get(`/api/v1/messages`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.users)).toBe(true)
    // Should return other users, so length >= 1
    expect(res.body.users.some((u) => u._id === user2Id)).toBe(true)

    // Security verification: no sensitive fields
    const user2 = res.body.users.find((u) => u._id === user2Id)
    expect(user2).not.toHaveProperty("password")
    expect(user2).not.toHaveProperty("refreshTokenHash")
    expect(user2).not.toHaveProperty("refreshTokenId")
  })

  it("PUT /api/v1/messages/mark-as-seen/:messageId - should mark message as seen", async () => {
    const res = await request(app)
      .put(`/api/v1/messages/mark-as-seen/${messageId}`)
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(200)
    expect(res.body.seen).toBe(true)
  })

  it("PUT /api/v1/messages/mark-as-seen/:messageId - should handle already seen message gracefully", async () => {
    const res = await request(app)
      .put(`/api/v1/messages/mark-as-seen/${messageId}`)
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(200)
  })

  it("PUT /api/v1/messages/mark-as-seen/:messageId - should fail if message belongs to another receiver", async () => {
    const res = await request(app)
      .put(`/api/v1/messages/mark-as-seen/${messageId}`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res.status).toBe(404)
    expect(res.body.message).toBe("Message not found or unauthorized.")
  })

  it("PUT /api/v1/messages/edit/:messageId - should allow owner to edit message", async () => {
    const res = await request(app)
      .put(`/api/v1/messages/edit/${messageId}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        text: "Edited message",
      })

    expect(res.status).toBe(200)
    expect(res.body.data.text).toBe("Edited message")
    expect(res.body.data.isEdited).toBe(true)
  })

  it("DELETE /api/v1/messages/delete/:messageId - should allow owner to soft delete message", async () => {
    const res = await request(app)
      .delete(`/api/v1/messages/delete/${messageId}`)
      .set("Authorization", `Bearer ${user1Token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.deleted).toBe(true)
  })

  it("PUT /api/v1/messages/edit/:messageId - should prevent unauthorized user from editing", async () => {
    const newMessage = await Message.create({
      senderId: user1Id,
      receiverId: user2Id,
      text: "Unauthorized edit test",
    })

    const res = await request(app)
      .put(`/api/v1/messages/edit/${newMessage._id}`)
      .set("Authorization", `Bearer ${user2Token}`)
      .send({
        text: "Hacked",
      })

    expect(res.status).toBe(403)
  })

  it("DELETE /api/v1/messages/delete/:messageId - should prevent unauthorized user from deleting", async () => {
    const newMessage = await Message.create({
      senderId: user1Id,
      receiverId: user2Id,
      text: "Unauthorized delete test",
    })

    const res = await request(app)
      .delete(`/api/v1/messages/delete/${newMessage._id}`)
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(403)
  })

  it("POST /api/v1/messages/send/:id - should set status=sent when receiver offline", async () => {
    const res = await request(app)
      .post(`/api/v1/messages/send/${user2Id}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ text: "Offline test" })

    expect(res.status).toBe(201)
    expect(res.body.data.status).toBe("sent")
    expect(res.body.data.sentAt).toBeDefined()
  })

  it("GET /api/v1/messages/sync - should return unseen messages for reconnecting client", async () => {
    const res = await request(app)
      .get("/api/v1/messages/sync")
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body.every((m) => m.receiverId === user2Id)).toBe(true)
  })

  it("PUT /api/v1/messages/mark-conversation-seen/:senderId - should batch mark messages as seen", async () => {
    const res = await request(app)
      .put(`/api/v1/messages/mark-conversation-seen/${user1Id}`)
      .set("Authorization", `Bearer ${user2Token}`)

    expect(res.status).toBe(200)
    expect(res.body.modifiedCount).toBeGreaterThan(0)

    const msgs = await Message.find({
      senderId: user1Id,
      receiverId: user2Id,
    })
    msgs.forEach((m) => {
      expect(m.status).toBe("read")
      expect(m.readAt).toBeDefined()
    })
  })
})
