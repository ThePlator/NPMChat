import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"
import Message from "../models/Message.js"
import jwt from "jsonwebtoken"

describe("Integration & Concurrency Tests", () => {
    let user1Token = ""
    let user2Token = ""
    let user1Id = ""
    let user2Id = ""

    beforeAll(async () => {
        await User.deleteMany({})
        await Message.deleteMany({})

        const emailVerificationToken1 = jwt.sign(
            { email: "integration1@example.com", type: "email-verification" },
            process.env.JWT_SECRET || "test-secret"
        )
        const res1 = await request(app).post("/api/v1/auth/signup").send({
            email: "integration1@example.com",
            password: "password123",
            name: "Integration One",
            emailVerificationToken: emailVerificationToken1,
        })
        user1Token = res1.body.token
        user1Id = res1.body.user.id

        const emailVerificationToken2 = jwt.sign(
            { email: "integration2@example.com", type: "email-verification" },
            process.env.JWT_SECRET || "test-secret"
        )
        const res2 = await request(app).post("/api/v1/auth/signup").send({
            email: "integration2@example.com",
            password: "password123",
            name: "Integration Two",
            emailVerificationToken: emailVerificationToken2,
        })
        user2Token = res2.body.token
        user2Id = res2.body.user.id
    })

    it("Cloudinary File Upload Mocking - should save mock image URL", async () => {
        const res = await request(app)
            .post(`/api/v1/messages/send/${user2Id}`)
            .set("Authorization", `Bearer ${user1Token}`)
            .send({ text: "Here is an image", image: "data:image/png;base64,mockbase64data" })

        expect(res.status).toBe(201)
        expect(res.body.data.text).toBe("Here is an image")
        // The mock cloudinary returns "https://mock.cloudinary.com/image.png"
        expect(res.body.data.image).toBe("https://mock.cloudinary.com/image.png")

        // Verify it was persisted
        const savedMessage = await Message.findById(res.body.data._id)
        expect(savedMessage.image).toBe("https://mock.cloudinary.com/image.png")
    })

    it("Database Concurrency & Conflict Testing - should throw VersionError on concurrent edits", async () => {
        // 1. Create a message
        const message = await Message.create({
            senderId: user1Id,
            receiverId: user2Id,
            text: "Original text"
        })

        // 2. Fetch the message twice concurrently (simulating two processes reading at the same time)
        const doc1 = await Message.findById(message._id)
        const doc2 = await Message.findById(message._id)

        // 3. Edit them both
        doc1.text = "First concurrent edit"
        doc2.text = "Second concurrent edit"

        // 4. Save the first one (should succeed and increment __v)
        await doc1.save()

        // 5. Save the second one (should fail with VersionError because __v is now outdated)
        let error
        try {
            await doc2.save()
        } catch (err) {
            error = err
        }

        expect(error).toBeDefined()
        expect(error.name).toBe("VersionError")
        
        // 6. Verify the database has the first edit
        const finalDoc = await Message.findById(message._id)
        expect(finalDoc.text).toBe("First concurrent edit")
        expect(finalDoc.__v).toBe(1)
    })

    it("Message status state machine - should transition sent→delivered→read correctly", async () => {
        // Create a message (receiver is offline in tests, so status = sent)
        const msg = await Message.create({
            senderId: user1Id,
            receiverId: user2Id,
            text: "Status machine test",
            status: "sent",
            sentAt: new Date(),
        })

        expect(msg.status).toBe("sent")
        expect(msg.seen).toBe(false)
        expect(msg.readAt).toBeUndefined()

        // Simulate delivery sweep
        msg.delivered = true
        msg.status = "delivered"
        msg.deliveredAt = new Date()
        await msg.save()

        expect(msg.status).toBe("delivered")
        expect(msg.deliveredAt).toBeDefined()

        // Simulate mark as read
        msg.seen = true
        msg.status = "read"
        msg.readAt = new Date()
        await msg.save()

        expect(msg.status).toBe("read")
        expect(msg.seen).toBe(true)
        expect(msg.readAt).toBeDefined()

        // Verify all timestamps are in order
        expect(msg.sentAt <= msg.deliveredAt).toBe(true)
        expect(msg.deliveredAt <= msg.readAt).toBe(true)
    })

    it("Sync endpoint - should only return messages after cursor", async () => {
        const before = new Date()
        await new Promise((r) => setTimeout(r, 10))

        await Message.create({
            senderId: user1Id,
            receiverId: user2Id,
            text: "After cursor",
            status: "sent",
            sentAt: new Date(),
        })

        const res = await request(app)
            .get(`/api/v1/messages/sync?after=${before.toISOString()}`)
            .set("Authorization", `Bearer ${user2Token}`)

        expect(res.status).toBe(200)
        expect(res.body.length).toBe(1)
        expect(res.body[0].text).toBe("After cursor")
    })
})
