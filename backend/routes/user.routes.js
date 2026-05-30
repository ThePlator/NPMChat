import express from "express"
import {
  checkAuth,
  forgotPassword,
  login,
  resetPassword,
  signup,
  updateProfile,
  refresh,
  logout,
  sendOTP,
  verifyOTP,
} from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.middleware.js"
import {
  signupSchema,
  loginSchema,
  sendOTPSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/user.schema.js"
import {
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  setAuthCookies,             // ✅ imported
} from '../lib/utils.js'
import bcrypt from 'bcryptjs'
import passport from '../lib/passport.js'  // ✅ closing quote fixed

const userRouter = express.Router()

// ── Existing auth routes ──────────────────────────────────────────
userRouter.post("/signup", validateBody(signupSchema), signup)
userRouter.post("/login", validateBody(loginSchema), login)
userRouter.post("/refresh", refresh)
userRouter.post("/logout", logout)
userRouter.post("/send-otp", validateBody(sendOTPSchema), sendOTP)
userRouter.post("/verify-otp", validateBody(verifyOTPSchema), verifyOTP)
userRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword)
userRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword)
userRouter.get("/check-auth", protectRoute, checkAuth)
userRouter.put("/update-profile", protectRoute, updateProfile)

// ── Google OAuth routes ───────────────────────────────────────────
userRouter.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

userRouter.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user

      const newRefreshToken = generateRefreshToken()
      const newRefreshTokenId = generateRefreshTokenId()

      user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 10)
      user.refreshTokenId = newRefreshTokenId
      await user.save()

      const accessToken = generateAccessToken(user._id)

      setAuthCookies(res, newRefreshToken, newRefreshTokenId)   // ✅ now works

      res.cookie('oauthAccessToken', accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 60 * 1000,
        path: '/',
      })

      res.redirect(`${process.env.CLIENT_URL}/oauth-callback`)
    } catch (err) {
      console.error('OAuth callback error:', err)
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`)
    }
  }
)

export default userRouter