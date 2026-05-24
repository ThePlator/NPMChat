import express from "express"
import {
  checkAuth,
  login,
  signup,
  updateProfile,
} from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.middleware.js"
import { signupSchema, loginSchema } from "../schemas/user.schema.js"

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
userRouter.put("/update-profile", protectRoute, updateProfile)

export default userRouter
