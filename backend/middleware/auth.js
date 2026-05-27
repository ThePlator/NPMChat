import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ message: "Not authorized, no token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    if (decoded.isGuest) {
      req.user = {
        _id: decoded.id,
        name: decoded.name,
        isGuest: true,
        roomId: decoded.roomId,
      }
      return next()
    }

    const user = await User.findById(decoded.id).select(
      "-password -refreshTokenHash -refreshTokenId",
    )
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" })
    }
    req.user = user // Attach user to request object
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ code: "TOKEN_EXPIRED", message: "Access token expired" })
    }
    if (error.name === "JsonWebTokenError") {
      console.warn(`Token verification failed: ${error.message}`)
    } else {
      console.error("Token verification failed:", error)
    }
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}
