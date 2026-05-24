import { describe, it, expect, vi } from "vitest"
import request from "supertest"
import app from "../server.js"
import User from "../models/User.js"
import jwt from "jsonwebtoken"

vi.mock("../lib/mailer.js", () => ({
  sendPasswordResetEmail: vi.fn(),
}))

import { sendPasswordResetEmail } from "../lib/mailer.js"

describe("Password Reset Flow", () => {
  it("should issue a reset link and allow one-time password reset", async () => {
    const email = "resetme@example.com"
    const password = "password123"

    const emailVerificationToken = jwt.sign(
      { email, type: "email-verification" },
      process.env.JWT_SECRET || "test-secret"
    )

    const signupRes = await request(app).post("/api/v1/auth/signup").send({
      email,
      password,
      name: "Reset Me",
      emailVerificationToken,
    })
    expect(signupRes.status).toBe(201)

    const forgotRes = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email })

    expect(forgotRes.status).toBe(200)

    // Ensure mailer was invoked and extract token from URL
    expect(sendPasswordResetEmail).toHaveBeenCalled()
    const [{ resetUrl }] = sendPasswordResetEmail.mock.calls[0]
    expect(typeof resetUrl).toBe("string")

    const url = new URL(resetUrl)
    const token = url.searchParams.get("token")
    expect(token).toBeTruthy()

    const resetRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "newpassword123" })

    expect(resetRes.status).toBe(200)
    expect(resetRes.body.message).toBe("Password reset successful.")

    // Token must be one-time use
    const resetAgainRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "anotherpassword123" })

    expect(resetAgainRes.status).toBe(400)

    const user = await User.findOne({ email })
    expect(user).toBeTruthy()
    expect(user.passwordResetTokenHash).toBe(null)
    expect(user.passwordResetExpiresAt).toBe(null)
  })
})

