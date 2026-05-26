import express from "express"
import { protectRoute } from "../middleware/auth.js"
import {
  getMessages,
  getMediaMessages,
  getUserForSidebar,
  markMessagesAsSeen,
  sendMessage,
} from "../controllers/message.controller.js"

const messageRouter = express.Router()

messageRouter.get("/", protectRoute, getUserForSidebar)
messageRouter.get("/:userId", protectRoute, getMessages)
messageRouter.get("/media/:userId", protectRoute, getMediaMessages)
messageRouter.put("/mark-as-seen/:messageId", protectRoute, markMessagesAsSeen)
messageRouter.post("/send/:receiverId", protectRoute, sendMessage)

export default messageRouter
