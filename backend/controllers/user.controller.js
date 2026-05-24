import User from "../models/User.js"
import { generateToken } from "../lib/utils.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import { verifyRecaptcha } from "../lib/verifyRecaptcha.js"
import jwt from "jsonwebtoken"
import OTP from "../models/OTP.js"
import { sendOTPEmail } from "../lib/email.js"
import crypto from "crypto"
import { sendPasswordResetEmail } from "../lib/mailer.js"

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
  const { email, password, name, avatarUrl, bio, captchaToken, emailVerificationToken } = req.body // CHANGED: Standardize on avatarUrl instead of profilPic

  try {
    // Validate input
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required." })
    }

    // Require valid email verification token & CAPTCHA (unless running tests)
    if (process.env.NODE_ENV !== "test") {
      // 1. Verify CAPTCHA
      if (!captchaToken) {
        return res.status(400).json({
          message: "CAPTCHA token is required.",
        })
      }

      const isHuman = await verifyRecaptcha(captchaToken)
      if (!isHuman) {
        return res.status(400).json({
          message: "CAPTCHA verification failed.",
        })
      }

      // 2. Verify Email OTP Verification Token
      if (!emailVerificationToken) {
        return res.status(400).json({
          message: "Email verification token is required.",
        })
      }

      try {
        const decoded = jwt.verify(emailVerificationToken, process.env.JWT_SECRET)
        if (decoded.type !== "email-verification") {
          return res.status(400).json({
            message: "Invalid email verification session.",
          })
        }
        if (decoded.email !== email) {
          return res.status(400).json({
            message: "Email verification session does not match this signup email.",
          })
        }
      } catch (err) {
        return res.status(400).json({
          message: "Email verification session has expired or is invalid.",
        })
      }
    } else {
      // In test mode, we bypass email verification. If a captchaToken is sent, verify it
      if (captchaToken) {
        const isHuman = await verifyRecaptcha(captchaToken)
        if (!isHuman) {
          return res.status(400).json({
            message: "CAPTCHA verification failed.",
          })
        }
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." })
    }

    const salt = await bcrypt.genSalt(10)
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      avatarUrl: avatarUrl || "", // CHANGED: Standardize on avatarUrl instead of profilPic
      bio: bio || "", // Default to empty string if not provided
    })

    await newUser.save()

    // Generate token
    const token = generateToken(newUser._id)

    res.status(201).json({
      message: "User created successfully.",
      user: {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
      },
      token,
    })
  } catch (error) {
    console.error("Error during signup:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

export const login = async (req, res) => {
    const { email, password, captchaToken } = req.body

    try {
      // Validate input
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required." })
      }

      if (process.env.NODE_ENV !== "test") {
        if (!captchaToken) {
          return res.status(400).json({
            message: "CAPTCHA token is required.",
          })
        }

        const isHuman = await verifyRecaptcha(captchaToken)

        if (!isHuman) {
          return res.status(400).json({
            message: "CAPTCHA verification failed.",
          })
        }
      }

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." })
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password." })
      }

      // Generate token
      const token = generateToken(user._id)

      res.status(200).json({
        message: "Login successful.",
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatarUrl,
          bio: user.bio,
        },
        token,
      })
    } catch (error) {
      console.error("Error during login:", error)
      res.status(500).json({ message: "Internal server error." })
    }
  }

  export const checkAuth = (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized." })
      }

      res.status(200).json({
        user: {
          id: req.user._id,
          email: req.user.email,
          name: req.user.name,
          avatarUrl: req.user.avatarUrl,
          bio: req.user.bio,
        },
      })
    } catch (error) {
      console.error("Error checking authentication:", error)
      res.status(500).json({ message: "Internal server error." })
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

      // Always return a generic success response to avoid user enumeration.
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
      const hashedPassword = await bcrypt.hash(password, salt)
      user.password = hashedPassword
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

  // Controller to update user profile
  export const updateProfile = async (req, res) => {
    const { name, avatarUrl, bio } = req.body
    const userId = req.user._id // Assuming user ID is available in req.user
    let updatedData

    try {
      if (!avatarUrl) {
        updatedData = await User.findByIdAndUpdate(
          userId,
          { name, bio },
          { new: true },
        )
      } else {
        const uploadedImage = await cloudinary.uploader.upload(avatarUrl)

        updatedData = await User.findByIdAndUpdate(
          userId,
          { name, avatarUrl: uploadedImage.secure_url, bio },
          { new: true },
        )
      }

      res.status(200).json({
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
      res.status(500).json({ message: "Internal server error." })
    }
  }

  export const sendOTP = async (req, res) => {
    const { email, captchaToken } = req.body

    try {
      if (!email) {
        return res.status(400).json({ message: "Email is required." })
      }

      // Verify CAPTCHA if configured, not in test environment, and no existing OTP exists (i.e. first time send)
      const existingOtp = await OTP.findOne({ email })
      if (!existingOtp && process.env.NODE_ENV !== "test" && process.env.RECAPTCHA_SECRET_KEY) {
        if (!captchaToken) {
          return res.status(400).json({ message: "CAPTCHA token is required." })
        }
        const isHuman = await verifyRecaptcha(captchaToken)
        if (!isHuman) {
          return res.status(400).json({ message: "CAPTCHA verification failed." })
        }
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: "User already exists." })
      }

      // Generate a 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // Delete any existing OTPs for this email to avoid duplicates
      await OTP.deleteMany({ email })

      // Save to temporary OTP collection
      const newOTP = new OTP({ email, otp })
      await newOTP.save()

      // Dispatch the email
      const emailResult = await sendOTPEmail(email, otp)

      res.status(200).json({
        message: emailResult.devMode
          ? "OTP generated (logged to console in development mode)."
          : "OTP sent successfully to your email.",
        devMode: emailResult.devMode,
      })
    } catch (error) {
      console.error("Error sending OTP:", error)
      res.status(500).json({ message: "Internal server error." })
    }
  }

  export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body

    try {
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required." })
      }

      // Find the latest OTP for the email
      const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 })

      if (!otpRecord) {
        return res.status(400).json({ message: "OTP has expired or does not exist. Please request a new one." })
      }

      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP code." })
      }

      // Valid OTP - Delete OTP records for this email
      await OTP.deleteMany({ email })

      // Generate email verification token (valid for 15 minutes)
      const emailVerificationToken = jwt.sign(
        { email, type: "email-verification" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      )

      res.status(200).json({
        message: "Email verified successfully.",
        emailVerificationToken,
      })
    } catch (error) {
      console.error("Error verifying OTP:", error)
      res.status(500).json({ message: "Internal server error." })
    }
  }

