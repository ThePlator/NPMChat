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

userRouter.post("/signup", validateBody(signupSchema), signup)
userRouter.post("/login", validateBody(loginSchema), login)
userRouter.get("/check-auth", protectRoute, checkAuth)
userRouter.put("/update-profile", protectRoute, updateProfile)

export default userRouter
