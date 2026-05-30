import jwt from "jsonwebtoken"
import crypto from "crypto"

// Short-lived access token (15 minutes)
export function generateAccessToken(userId) {
  if (!userId) {
    throw new Error("User ID is required to generate a token")
  }
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  })
}

// Backward-compatible alias (used in older parts of the code)
export const generateToken = generateAccessToken

// Refresh token — random 64-byte hex string (not a JWT)
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex")
}

// Unique ID to look up the refresh token in the DB
export function generateRefreshTokenId() {
  return crypto.randomUUID()
}



const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth",
}

const COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api/v1/auth",
}

export function setAuthCookies(res, refreshToken, refreshTokenId) {
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
  res.cookie("refreshTokenId", refreshTokenId, COOKIE_OPTIONS)
}

export function clearAuthCookies(res) {
  res.clearCookie("refreshToken", COOKIE_CLEAR_OPTIONS)
  res.clearCookie("refreshTokenId", COOKIE_CLEAR_OPTIONS)
}