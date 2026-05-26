import express from "express"
import {
  checkAuth,
  login,
  signup,
  updateProfile,
  sendOTP,
  forgotPassword,
} from "../controllers/user.controller.js"
import { protectRoute } from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post("/login", login)
userRouter.post("/signup", signup)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/forgot-password", forgotPassword)
userRouter.get("/check-auth", protectRoute, checkAuth)
userRouter.put("/update-profile", protectRoute, updateProfile)

export default userRouter
