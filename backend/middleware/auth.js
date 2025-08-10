import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select("-password")
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" })
    }
    req.user = user // Attach user to request object
    next()
  } catch (error) {
    console.error("Token verification failed:", error)
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}
