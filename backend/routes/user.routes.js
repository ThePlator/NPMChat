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
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  sendOTPSchema,
  verifyOTPSchema,
} from "../schemas/user.schema.js"

const userRouter = express.Router()

userRouter.post("/signup", validateBody(signupSchema), signup)
userRouter.post("/login", validateBody(loginSchema), login)
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
userRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  forgotPassword,
)
userRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  resetPassword,
)
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

export default userRouter
