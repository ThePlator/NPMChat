import User from "../models/User.js"
import { generateAccessToken, generateRefreshToken, generateRefreshTokenId } from "../lib/utils.js"
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import { verifyRecaptcha } from "../lib/verifyRecaptcha.js"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth",
}

const setAuthCookies = (res, refreshToken, refreshTokenId) => {
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
  res.cookie("refreshTokenId", refreshTokenId, COOKIE_OPTIONS)
}

const clearAuthCookies = (res) => {
  res.clearCookie("refreshToken", COOKIE_OPTIONS)
  res.clearCookie("refreshTokenId", COOKIE_OPTIONS)
}

export const signup = async (req, res) => {
  const { email, password, name, avatarUrl, bio, captchaToken } = req.body

  try {
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: "Email, password, and name are required." })
    }

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

    res.status(201).json({
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
    res.status(500).json({ message: "Internal server error." })
  }
}

export const login = async (req, res) => {
  const { email, password, captchaToken } = req.body

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." })
    }

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

    res.status(200).json({
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
    res.status(500).json({ message: "Internal server error." })
  }
}

export const refresh = async (req, res) => {
  const { refreshToken, refreshTokenId } = req.cookies

  if (!refreshToken || !refreshTokenId) {
    return res.status(401).json({ message: "Session expired or invalid" })
  }

  try {
    const user = await User.findOne({ refreshTokenId })
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({ message: "Invalid session" })
    }

    const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash)
    if (!isMatch) {
      // Security: if token ID matches but hash doesn't, someone might be reusing an old token
      // In a strict rotation policy, we could invalidate all sessions for this user.
      // For now, just clear this one.
      user.refreshTokenHash = null
      user.refreshTokenId = null
      await user.save()
      clearAuthCookies(res)
      return res.status(401).json({ message: "Invalid refresh token" })
    }

    // Token Rotation
    const newRefreshToken = generateRefreshToken()
    const newRefreshTokenId = generateRefreshTokenId()
    
    user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10)
    user.refreshTokenId = newRefreshTokenId
    await user.save()

    const accessToken = generateAccessToken(user._id)

    setAuthCookies(res, newRefreshToken, newRefreshTokenId)

    res.status(200).json({
      token: accessToken,
    })
  } catch (error) {
    console.error("Error during refresh:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

export const logout = async (req, res) => {
  try {
    const { refreshTokenId } = req.cookies
    if (refreshTokenId) {
      await User.findOneAndUpdate(
        { refreshTokenId },
        { refreshTokenHash: null, refreshTokenId: null }
      )
    }
    
    clearAuthCookies(res)
    res.status(200).json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
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

export const updateProfile = async (req, res) => {
  const { name, avatarUrl, bio } = req.body
  const userId = req.user._id
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
