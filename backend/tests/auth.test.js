import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import mongoose from "mongoose"

describe("Auth Routes", () => {
    let testToken = ""
    const testUser = {
        email: "testuser@example.com",
        password: "password123",
        name: "Test User",
    }

    it("POST /api/v1/auth/signup - should register a new user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send(testUser)

        expect(res.status).toBe(201)
        expect(res.body.message).toBe("User created successfully.")
        expect(res.body.user).toHaveProperty("id")
        expect(res.body.user.email).toBe(testUser.email)
        expect(res.body).toHaveProperty("token")

        testToken = res.body.token // Save for later tests
    })

    it("POST /api/v1/auth/signup - should fail with duplicate email", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send(testUser)

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("User already exists.")
    })

    it("POST /api/v1/auth/signup - should fail with missing fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ email: "new@example.com" }) // Missing password and name

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Email, password, and name are required.")
    })

    it("POST /api/v1/auth/login - should login user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password,
            })

        expect(res.status).toBe(200)
        expect(res.body.message).toBe("Login successful.")
        expect(res.body).toHaveProperty("token")
    })

    it("POST /api/v1/auth/login - should fail with wrong password", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: "wrongpassword",
            })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Invalid email or password.")
    })

    it("GET /api/v1/auth/check-auth - should return user profile if authenticated", async () => {
        const res = await request(app)
            .get("/api/v1/auth/check-auth")
            .set("Authorization", `Bearer ${testToken}`)

        expect(res.status).toBe(200)
        expect(res.body.user.email).toBe(testUser.email)
        expect(res.body.user.name).toBe(testUser.name)
    })

    it("GET /api/v1/auth/check-auth - should fail if no token", async () => {
        const res = await request(app)
            .get("/api/v1/auth/check-auth")

        expect(res.status).toBe(401)
        expect(res.body.message).toBe("Not authorized, no token")
    })
})