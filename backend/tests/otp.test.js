import { describe, it, expect } from "vitest"
import request from "supertest"
import app from "../server.js"
import OTP from "../models/OTP.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

describe("OTP Verification Routes", () => {
    const testEmail = "otp-test@example.com"

    it("POST /api/v1/auth/send-otp - should generate and store OTP", async () => {
        // Ensure user does not exist
        await User.deleteOne({ email: testEmail })
        await OTP.deleteOne({ email: testEmail })

        const res = await request(app)
            .post("/api/v1/auth/send-otp")
            .send({ email: testEmail })

        expect(res.status).toBe(200)
        expect(res.body.message).toBeDefined()

        // Verify OTP is in database
        const otpRecord = await OTP.findOne({ email: testEmail })
        expect(otpRecord).not.toBeNull()
        expect(otpRecord.otp).toHaveLength(6)
    })

    it("POST /api/v1/auth/send-otp - should fail if user already exists", async () => {
        // Create user
        await User.create({
            email: testEmail,
            name: "Existing User",
            password: "password123"
        })

        const res = await request(app)
            .post("/api/v1/auth/send-otp")
            .send({ email: testEmail })

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("User already exists.")

        // Cleanup user
        await User.deleteOne({ email: testEmail })
    })

    it("POST /api/v1/auth/verify-otp - should verify valid OTP and return token", async () => {
        // Generate new OTP
        await OTP.deleteOne({ email: testEmail })
        const dummyOtp = "123456"
        await OTP.create({ email: testEmail, otp: dummyOtp })

        const res = await request(app)
            .post("/api/v1/auth/verify-otp")
            .send({ email: testEmail, otp: dummyOtp })

        expect(res.status).toBe(200)
        expect(res.body.emailVerificationToken).toBeDefined()

        // Verify JWT contains the email
        const decoded = jwt.verify(res.body.emailVerificationToken, process.env.JWT_SECRET)
        expect(decoded.email).toBe(testEmail)
        expect(decoded.type).toBe("email-verification")

        // Verify OTP record is deleted from DB
        const otpRecord = await OTP.findOne({ email: testEmail })
        expect(otpRecord).toBeNull()
    })

    it("POST /api/v1/auth/verify-otp - should fail with invalid OTP", async () => {
        // Generate new OTP
        await OTP.deleteOne({ email: testEmail })
        await OTP.create({ email: testEmail, otp: "111111" })

        const res = await request(app)
            .post("/api/v1/auth/verify-otp")
            .send({ email: testEmail, otp: "999999" }) // Mismatch

        expect(res.status).toBe(400)
        expect(res.body.message).toBe("Invalid OTP code.")
    })
})
