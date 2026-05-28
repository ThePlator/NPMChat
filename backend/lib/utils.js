import jwt from "jsonwebtoken"
import crypto from "crypto"

export function generateAccessToken(userId) {
  if (!userId) {
    throw new Error("User ID is required to generate a token")
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  })
}

export function generateRefreshToken() {
  return crypto.randomBytes(64).toString("hex")
}

export function generateRefreshTokenId() {
  return crypto.randomUUID()
}

export const generateToken = generateAccessToken

export function generateClientId() {
  return crypto.randomUUID()
}
