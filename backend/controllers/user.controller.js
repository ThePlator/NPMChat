import User from "../models/User.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import { verifyRecaptcha } from "../lib/verifyRecaptcha.js"
import jwt from "jsonwebtoken"
import OTP from "../models/OTP.js"
import crypto from "crypto"
import { sendPasswordResetEmail, sendOTPEmail } from "../lib/mailer.js"
import {
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  setAuthCookies,
  clearAuthCookies,
} from "../lib/utils.js"

function hashResetToken(token) {
  const pepper = process.env.RESET_TOKEN_PEPPER || ""
  return crypto.createHash("sha256").update(`${token}:${pepper}`).digest("hex")
}

function resetTokenExpiryDate() {
  const ttlMinutes = Number(process.env.RESET_TOKEN_TTL_MINUTES || 15)
  const safeTtl = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : 15
  return new Date(Date.now() + safeTtl * 60 * 1000)
}

export const signup = async (req, res) => {
  const { email, password, name, avatarUrl, bio, captchaToken, emailVerificationToken } = req.body

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "Email, password, and name are required." })
    }

    // Verify CAPTCHA (skip in test env)
    if (process.env.NODE_ENV !== "test") {
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required." })
      }
      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({ message: "CAPTCHA verification failed." })
      }
    } else if (captchaToken) {
      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({ message: "CAPTCHA verification failed." })
      }
    }

    // Verify email OTP token
    if (!emailVerificationToken) {
      return res.status(400).json({ message: "Email verification token is required." })
    }
    try {
      const decoded = jwt.verify(emailVerificationToken, process.env.JWT_SECRET)
      if (decoded.type !== "email-verification") {
        return res.status(400).json({ message: "Invalid email verification session." })
      }
      if (decoded.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ message: "Email verification session does not match this signup email." })
      }
    } catch {
      return res.status(400).json({ message: "Email verification session has expired or is invalid." })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const refreshToken = generateRefreshToken()
    const refreshTokenId = generateRefreshTokenId()
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      avatarUrl: avatarUrl || "",
      bio: bio || "",
      refreshTokenHash,
      refreshTokenId,
    })

    await newUser.save()

    const accessToken = generateAccessToken(newUser._id)
    setAuthCookies(res, refreshToken, refreshTokenId)

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
      },
      token: accessToken,
    })
  } catch (error) {
    console.error("Error during signup:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const login = async (req, res) => {
  const { email, password, captchaToken } = req.body

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    if (process.env.NODE_ENV !== "test") {
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required." })
      }
      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({ message: "CAPTCHA verification failed." })
      }
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." })
    }

    const refreshToken = generateRefreshToken()
    const refreshTokenId = generateRefreshTokenId()

    user.refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    user.refreshTokenId = refreshTokenId
    await user.save()

    const accessToken = generateAccessToken(user._id)
    setAuthCookies(res, refreshToken, refreshTokenId)

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
      token: accessToken,
    })
  } catch (error) {
    console.error("Error during login:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const loginGuest = async (req, res) => {
  const { name, roomId } = req.body

  try {
    if (!name || !roomId) {
      return res.status(400).json({ message: "Name and roomId are required for guest login." })
    }

    const guestId = `guest-${crypto.randomUUID()}`

    const guestToken = jwt.sign(
      { id: guestId, name, isGuest: true, roomId },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    )

    return res.status(200).json({
      message: "Guest login successful.",
      user: {
        id: guestId,
        email: null,
        name,
        avatarUrl: "",
        bio: "Ephemeral Guest Account",
        isGuest: true,
        roomId,
      },
      token: guestToken,
    })
  } catch (error) {
    console.error("Error during guest login:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const refresh = async (req, res) => {
  const { refreshToken, refreshTokenId } = req.cookies || {}

  if (!refreshToken || !refreshTokenId) {
    return res.status(401).json({ message: "Session expired or invalid" })
  }

  try {
    const user = await User.findOne({ refreshTokenId })
    if (!user || !user.refreshTokenHash) {
      clearAuthCookies(res)
      return res.status(401).json({ message: "Invalid session" })
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!isMatch) {
      user.refreshTokenHash = null
      user.refreshTokenId = null
      await user.save()
      clearAuthCookies(res)
      return res.status(401).json({ message: "Invalid refresh token" })
    }

    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenId = generateRefreshTokenId()

    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10)
    user.refreshTokenId = newRefreshTokenId
    await user.save()

    const accessToken = generateAccessToken(user._id)
    setAuthCookies(res, newRefreshToken, newRefreshTokenId)

    return res.status(200).json({ token: accessToken })
  } catch (error) {
    console.error("Error during refresh:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const logout = async (req, res) => {
  try {
    const { refreshTokenId } = req.cookies || {}

    if (refreshTokenId) {
      await User.findOneAndUpdate(
        { refreshTokenId },
        { refreshTokenHash: null, refreshTokenId: null },
      )
    }

    clearAuthCookies(res)
    return res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const checkAuth = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized." })
    }

    return res.status(200).json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatarUrl: req.user.avatarUrl,
        bio: req.user.bio,
        isGuest: req.user.isGuest,
        roomId: req.user.roomId,
      },
    })
  } catch (error) {
    console.error("Error checking authentication:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const forgotPassword = async (req, res) => {
  const { email, captchaToken } = req.body

  try {
    if (process.env.NODE_ENV !== "test") {
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required." })
      }
      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({ message: "CAPTCHA verification failed." })
      }
    }

    const user = await User.findOne({ email })

    // Always return generic response to avoid user enumeration
    if (!user) {
      return res.status(200).json({
        message: "If an account exists for that email, a password reset link has been sent.",
      })
    }

    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = hashResetToken(rawToken)

    user.passwordResetTokenHash = tokenHash
    user.passwordResetExpiresAt = resetTokenExpiryDate()
    user.passwordResetUsedAt = null
    await user.save()

    const isProd = process.env.NODE_ENV === "production"
    if (!process.env.CLIENT_URL && isProd) {
      console.error("CLIENT_URL must be set in production")
      return res.status(500).json({ message: "Internal server error." })
    }
    const baseUrl = process.env.CLIENT_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(rawToken)}`
    await sendPasswordResetEmail({ to: user.email, resetUrl })

    return res.status(200).json({
      message: "If an account exists for that email, a password reset link has been sent.",
    })
  } catch (error) {
    console.error("Error during forgotPassword:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const resetPassword = async (req, res) => {
  const { token, password } = req.body

  try {
    const tokenHash = hashResetToken(token)
    const now = new Date()

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetUsedAt: null,
      passwordResetExpiresAt: { $gt: now },
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(password, salt)
    user.passwordResetUsedAt = now
    user.passwordResetTokenHash = null
    user.passwordResetExpiresAt = null
    await user.save()

    return res.status(200).json({ message: "Password reset successful." })
  } catch (error) {
    console.error("Error during resetPassword:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const updateProfile = async (req, res) => {
  const { name, avatarUrl, bio } = req.body
  const userId = req.user._id

  try {
    const updateFields = { name, bio }

    const nextAvatarUrl = (typeof avatarUrl === "string" ? avatarUrl : "").trim()
    const currentAvatarUrl = (req.user?.avatarUrl || "").trim()

    const shouldUploadNewAvatar =
      nextAvatarUrl &&
      nextAvatarUrl !== currentAvatarUrl &&
      nextAvatarUrl.startsWith("data:")

    if (shouldUploadNewAvatar) {
      const uploadedImage = await cloudinary.uploader.upload(nextAvatarUrl)
      updateFields.avatarUrl = uploadedImage.secure_url
    }

    const updatedData = await User.findByIdAndUpdate(userId, updateFields, { new: true })

    return res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedData._id,
        email: updatedData.email,
        name: updatedData.name,
        avatarUrl: updatedData.avatarUrl,
        bio: updatedData.bio,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const sendOTP = async (req, res) => {
  const { email, captchaToken } = req.body

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required." })
    }

    if (process.env.NODE_ENV !== "test") {
      if (!captchaToken) {
        return res.status(400).json({ message: "CAPTCHA token is required." })
      }
      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({ message: "CAPTCHA verification failed." })
      }
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    await OTP.deleteMany({ email })

    const newOTP = new OTP({ email, otp })
    await newOTP.save()

    const emailResult = await sendOTPEmail(email, otp)

    return res.status(200).json({
      message: emailResult.devMode
        ? "OTP generated (logged to console in development mode)."
        : "OTP sent successfully to your email.",
      devMode: emailResult.devMode,
    })
  } catch (error) {
    console.error("Error sending OTP:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body

  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." })
    }

    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 })

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP has expired or does not exist. Please request a new one.",
      })
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP code." })
    }

    await OTP.deleteMany({ email })

    const emailVerificationToken = jwt.sign(
      { email, type: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    )

    return res.status(200).json({
      message: "Email verified successfully.",
      emailVerificationToken,
    })
  } catch (error) {
    console.error("Error verifying OTP:", error)
    return res.status(500).json({ message: "Internal server error." })
  }
}