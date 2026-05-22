import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"
import Message from "../models/Message.js"

describe("Message Routes", () => {
    let user1Token = ""
    let user2Token = ""
    let user1Id = ""
    let user2Id = ""

    beforeAll(async () => {
        // Clear DB specifically for this suite
        await User.deleteMany({})
        await Message.deleteMany({})

        // Create User 1
        const res1 = await request(app).post("/api/v1/auth/signup").send({
            email: "user1@example.com",
            password: "password123",
            name: "User One",
        })
        user1Token = res1.body.token
        user1Id = res1.body.user.id

        // Create User 2
        const res2 = await request(app).post("/api/v1/auth/signup").send({
            email: "user2@example.com",
            password: "password123",
            name: "User Two",
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

    it("GET /api/v1/messages - should get users for sidebar", async () => {
        const res = await request(app)
            .get(`/api/v1/messages`)
            .set("Authorization", `Bearer ${user1Token}`)

        expect(res.status).toBe(200)
        expect(Array.isArray(res.body.users)).toBe(true)
        // Should return other users, so length >= 1
        expect(res.body.users.some(u => u._id === user2Id)).toBe(true)
    })
})