import { describe, it, expect, beforeAll } from "vitest"
import request from "supertest"
import app from "../server.js"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

describe("Auth Routes", () => {
    let testToken = ""
    const testUser = {
        email: "testuser@example.com",
        password: "password123",
        name: "Test User",
    }

    it("POST /api/v1/auth/signup - should register a new user", async () => {
        // 1. Send OTP
        await request(app)
            .post("/api/v1/auth/send-otp")
            .send({ email: testUser.email })

        // 2. Fetch the OTP from the test database
        const otpRecord = await mongoose.model("OTP").findOne({ email: testUser.email })
        expect(otpRecord).toBeDefined()
        const otp = otpRecord.otp

        // 3. Verify OTP to get emailVerificationToken
        const verifyRes = await request(app)
            .post("/api/v1/auth/verify-otp")
            .send({ email: testUser.email, otp })
        expect(verifyRes.status).toBe(200)
        const emailVerificationToken = verifyRes.body.emailVerificationToken
        expect(emailVerificationToken).toBeDefined()

        // 4. Finally call signup with the token
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({
                ...testUser,
                emailVerificationToken,
            })

        expect(res.status).toBe(201)
        expect(res.body.message).toBe("User created successfully.")
        expect(res.body.user).toHaveProperty("id")
        expect(res.body.user.email).toBe(testUser.email)
        expect(res.body).toHaveProperty("token")

        testToken = res.body.token // Save for later tests
    })

    it("POST /api/v1/auth/signup - should fail with duplicate email", async () => {
        // Sign verification token directly for testUser.email
        const emailVerificationToken = jwt.sign(
            { email: testUser.email, type: "email-verification" },
            process.env.JWT_SECRET || "test-secret"
        )

        // Attempt signup with duplicate email
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({
                ...testUser,
                emailVerificationToken,
            })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("User already exists.")
    })

    it("POST /api/v1/auth/signup - should fail with missing fields", async () => {
        const res = await request(app)
            .post("/api/v1/auth/signup")
            .send({ email: "new@example.com" }) // Missing password and name

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Validation error")
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

    it("GET /api/v1/auth/check-auth - should fail if token is invalid", async () => {
        const res = await request(app)
            .get("/api/v1/auth/check-auth")
            .set("Authorization", `Bearer invalid_fake_token`)

        expect(res.status).toBe(401)
        expect(res.body.message).toBe("Not authorized, token failed")
    })
})