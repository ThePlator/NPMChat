import express from "express"
import { protectRoute } from "../middleware/auth.js"
import {
  getMessages,
  getMediaMessages,
  getUserForSidebar,
  markMessagesAsSeen,
  sendMessage,
  editMessage,
  deleteMessage,
} from "../controllers/message.controller.js"

const messageRouter = express.Router()

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Protected chat user and message operations
 */

/**
 * @swagger
 * /api/v1/messages:
 *   get:
 *     summary: Get users for the chat sidebar
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sidebar users and unseen message counts
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
messageRouter.get("/", protectRoute, getUserForSidebar)

/**
 * @swagger
 * /api/v1/messages/media/{userId}:
 *   get:
 *     summary: Get media messages (images) exchanged with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch media messages for
 *     responses:
 *       200:
 *         description: Paginated media messages
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
messageRouter.get("/media/:userId", protectRoute, getMediaMessages)

/**
 * @swagger
 * /api/v1/messages/{userId}:
 *   get:
 *     summary: Get messages exchanged with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to fetch the conversation with
 *     responses:
 *       200:
 *         description: Conversation messages
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
messageRouter.get("/:userId", protectRoute, getMessages)

/**
 * @swagger
 * /api/v1/messages/mark-as-seen/{messageId}:
 *   put:
 *     summary: Mark a message as seen
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID to mark as seen
 *     responses:
 *       200:
 *         description: Updated message
 *       401:
 *         description: Missing or invalid JWT
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
messageRouter.put("/mark-as-seen/:messageId", protectRoute, markMessagesAsSeen)

/**
 * @swagger
 * /api/v1/messages/send/{receiverId}:
 *   post:
 *     summary: Send a message to another user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: Recipient user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: Hey, are you free today?
 *               image:
 *                 type: string
 *                 example: data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       401:
 *         description: Missing or invalid JWT
 *       500:
 *         description: Internal server error
 */
messageRouter.post("/send/:receiverId", protectRoute, sendMessage)
messageRouter.put("/edit/:messageId", protectRoute, editMessage)
messageRouter.delete("/delete/:messageId", protectRoute, deleteMessage)

export default messageRouter
