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
    const otpRecord = await mongoose
      .model("OTP")
      .findOne({ email: testUser.email })
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

    // Verify cookies
    const cookies = res.headers["set-cookie"]
    expect(cookies).toBeDefined()
    expect(cookies.some((c) => c.includes("refreshToken="))).toBe(true)
    expect(cookies.some((c) => c.includes("refreshTokenId="))).toBe(true)

    testToken = res.body.token // Save for later tests
  })

  it("POST /api/v1/auth/signup - should fail with duplicate email", async () => {
    // Sign verification token directly for testUser.email
    const emailVerificationToken = jwt.sign(
      { email: testUser.email, type: "email-verification" },
      process.env.JWT_SECRET || "test-secret",
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

  it("POST /api/v1/auth/signup - should succeed even with case differences in email", async () => {
    // Generate an OTP and verification token with lowercase email
    const emailLower = "casetest@example.com"
    const emailUpper = "CASETEST@example.com"

    const emailVerificationToken = jwt.sign(
      { email: emailLower, type: "email-verification" },
      process.env.JWT_SECRET || "test-secret",
    )

    // Attempt signup with uppercase email
    const res = await request(app).post("/api/v1/auth/signup").send({
      email: emailUpper,
      password: "password123",
      name: "Case Test User",
      emailVerificationToken,
    })

    expect(res.status).toBe(201)
    expect(res.body.message).toBe("User created successfully.")
    expect(res.body.user.email).toBe(emailUpper.toLowerCase())
  })

  it("POST /api/v1/auth/signup - should fail with missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/signup")
      .send({ email: "new@example.com" }) // Missing password and name

    expect(res.status).toBe(400)
    expect(res.body.message).toBe("Validation error")
  })

  it("POST /api/v1/auth/login - should login user and set cookies", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Login successful.")
    expect(res.body).toHaveProperty("token")

    // Verify cookies
    const cookies = res.headers["set-cookie"]
    expect(cookies).toBeDefined()
    expect(cookies.some((c) => c.includes("refreshToken="))).toBe(true)
    expect(cookies.some((c) => c.includes("refreshTokenId="))).toBe(true)
  })

  it("POST /api/v1/auth/refresh - should fail if no cookies provided", async () => {
    const res = await request(app).post("/api/v1/auth/refresh")

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Session expired or invalid")
  })

  it("POST /api/v1/auth/refresh - should issue new access token and rotate refresh tokens", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    })

    const cookies = loginRes.headers["set-cookie"]
    const refreshToken = cookies
      .find((c) => c.startsWith("refreshToken="))
      .split(";")[0]
    const refreshTokenId = cookies
      .find((c) => c.startsWith("refreshTokenId="))
      .split(";")[0]

    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [refreshToken, refreshTokenId])

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("token")

    // Verify rotation
    const newCookies = res.headers["set-cookie"]
    expect(newCookies.find((c) => c.startsWith("refreshToken="))).not.toBe(
      refreshToken,
    )
    expect(newCookies.find((c) => c.startsWith("refreshTokenId="))).not.toBe(
      refreshTokenId,
    )
  })

  it("POST /api/v1/auth/refresh - should fail with old token (rotated away)", async () => {
    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    })

    const cookies = loginRes.headers["set-cookie"]
    const refreshToken = cookies
      .find((c) => c.startsWith("refreshToken="))
      .split(";")[0]
    const refreshTokenId = cookies
      .find((c) => c.startsWith("refreshTokenId="))
      .split(";")[0]

    // Successful refresh (invalidates original ID and Token)
    await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [refreshToken, refreshTokenId])

    // Attempt reuse of OLD ID/Token
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", [refreshToken, refreshTokenId])

    expect(res.status).toBe(401)
    expect(res.body.message).toBe("Invalid session")
  })

  it("PUT /api/v1/auth/update-profile - should update name and bio", async () => {
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

  it("POST /api/v1/auth/logout - should succeed even with no cookies", async () => {
    const res = await request(app).post("/api/v1/auth/logout")

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Logged out successfully")

    // Verify cookies are cleared
    const cookies = res.headers["set-cookie"]
    expect(cookies.some((c) => c.includes("refreshToken=;"))).toBe(true)
  })

  it("GET /api/v1/auth/check-auth - should return TOKEN_EXPIRED for expired token", async () => {
    // Generate an expired token
    const expiredToken = jwt.sign(
      { id: new mongoose.Types.ObjectId().toString() },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "0s" },
    )

    const res = await request(app)
      .get("/api/v1/auth/check-auth")
      .set("Authorization", `Bearer ${expiredToken}`)

    expect(res.status).toBe(401)
    expect(res.body.code).toBe("TOKEN_EXPIRED")
  })

  it("GET /api/v1/auth/check-auth - should return user profile if authenticated", async () => {
    const res = await request(app)
      .get("/api/v1/auth/check-auth")
      .set("Authorization", `Bearer ${testToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe(testUser.email)
    // Name was updated to "Updated Name" in the previous test
    expect(res.body.user.name).toBe("Updated Name")
  })

  it("GET /api/v1/auth/check-auth - should fail if no token", async () => {
    const res = await request(app).get("/api/v1/auth/check-auth")

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

  it("POST /api/v1/auth/guest-login - should generate a guest token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/guest-login")
      .send({ name: "Test Guest", roomId: "test-room" })

    expect(res.status).toBe(200)
    expect(res.body.message).toBe("Guest login successful.")
    expect(res.body.user.isGuest).toBe(true)
    expect(res.body.user.name).toBe("Test Guest")
    expect(res.body.user.roomId).toBe("test-room")
    expect(res.body.token).toBeDefined()

    // Save guest token to test check-auth bypass
    testToken = res.body.token
  })

  it("POST /api/v1/auth/guest-login - should fail if missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/guest-login")
      .send({ name: "Test Guest" }) // Missing roomId

    expect(res.status).toBe(400)
    expect(res.body.message).toBe(
      "Name and roomId are required for guest login.",
    )
  })

  it("GET /api/v1/auth/check-auth - should bypass database and return guest user object", async () => {
    const res = await request(app)
      .get("/api/v1/auth/check-auth")
      .set("Authorization", `Bearer ${testToken}`)

    expect(res.status).toBe(200)
    expect(res.body.user.isGuest).toBe(true)
    expect(res.body.user.name).toBe("Test Guest")
    expect(res.body.user.roomId).toBe("test-room")
    // Verify it generates a guest- ID
    expect(res.body.user.id.startsWith("guest-")).toBe(true)
  })
})
