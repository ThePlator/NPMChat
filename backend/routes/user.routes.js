import express from "express"
import {
  checkAuth,
  forgotPassword,
  login,
  resetPassword,
  signup,
  updateProfile,
<<<<<<< HEAD
  refresh,
  logout,
=======
  sendOTP,
  verifyOTP,
>>>>>>> upstream/main
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

const userRouter = express.Router()

userRouter.post("/signup", validateBody(signupSchema), signup)
userRouter.post("/login", validateBody(loginSchema), login)
<<<<<<< HEAD
userRouter.post("/refresh", refresh)
userRouter.post("/logout", logout)
=======
userRouter.post("/send-otp", validateBody(sendOTPSchema), sendOTP)
userRouter.post("/verify-otp", validateBody(verifyOTPSchema), verifyOTP)
userRouter.post("/forgot-password", validateBody(forgotPasswordSchema), forgotPassword)
userRouter.post("/reset-password", validateBody(resetPasswordSchema), resetPassword)
>>>>>>> upstream/main
userRouter.get("/check-auth", protectRoute, checkAuth)
userRouter.put("/update-profile", protectRoute, updateProfile)

export default userRouter
