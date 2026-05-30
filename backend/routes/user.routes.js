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
  loginGuest,
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
  updateProfileSchema,
} from "../schemas/user.schema.js"
import {
  generateAccessToken,
  generateRefreshToken,
  generateRefreshTokenId,
  setAuthCookies,
} from "../lib/utils.js"
import bcrypt from "bcryptjs"
import passport from "../lib/passport.js"

const userRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration, login, and profile authentication
 */

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword
 *               name:
 *                 type: string
 *                 example: Alex Chen
 *               avatarUrl:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *               bio:
 *                 type: string
 *                 example: Building chat apps.
 *               captchaToken:
 *                 type: string
 *                 example: recaptcha-token
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input, duplicate user, or CAPTCHA failure
 *       500:
 *         description: Internal server error
 */
userRouter.post("/signup", validateBody(signupSchema), signup)

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in an existing user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: strongpassword
 *               captchaToken:
 *                 type: string
 *                 example: recaptcha-token
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or CAPTCHA failure
 *       500:
 *         description: Internal server error
 */
userRouter.post("/login", validateBody(loginSchema), login)

/**
 * @swagger
 * /api/v1/auth/check-auth:
 *   get:
 *     summary: Check the current user's authentication status
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current authenticated user
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
userRouter.post("/refresh", refresh)
userRouter.post("/logout", logout)
userRouter.post("/send-otp", validateBody(sendOTPSchema), sendOTP)
userRouter.post("/verify-otp", validateBody(verifyOTPSchema), verifyOTP)

/**
 * @swagger
 * /api/v1/auth/guest-login:
 *   post:
 *     summary: Log in an ephemeral guest user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - roomId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Guest User
 *               roomId:
 *                 type: string
 *                 example: 64fcb9e82f1b4c001f8d4a9c
 *     responses:
 *       200:
 *         description: Guest login successful
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
userRouter.post("/guest-login", loginGuest)
userRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword)
userRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword)
userRouter.get("/check-auth", protectRoute, checkAuth)

/**
 * @swagger
 * /api/v1/auth/update-profile:
 *   put:
 *     summary: Update the current user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Alex Chen
 *               avatarUrl:
 *                 type: string
 *                 example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
 *               bio:
 *                 type: string
 *                 example: Building chat apps.
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
userRouter.put(
  "/update-profile",
  protectRoute,
  validateBody(updateProfileSchema),
  updateProfile,
)

// ── Google OAuth routes ───────────────────────────────────────────
userRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false }),
)

userRouter.get(
  "/google/callback",
  passport.authenticate("google", {
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

      setAuthCookies(res, newRefreshToken, newRefreshTokenId)

      res.cookie("oauthAccessToken", accessToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 60 * 1000,
        path: "/",
      })

      res.redirect(`${process.env.CLIENT_URL}/oauth-callback`)
    } catch (err) {
      console.error("OAuth callback error:", err)
      res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`)
    }
  },
)

export default userRouter