import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSockets } from "../server.js"

export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id // Get the user ID from the request object

    // Guests do not have a sidebar of DMs
    if (typeof userId === "string" && userId.startsWith("guest-")) {
      return res.status(200).json({ users: [], unseenMessages: {} })
    }

    const [filteredUser, unseenMessageCounts] = await Promise.all([
      User.find({ _id: { $ne: userId } })
        .select("-password -refreshTokenHash -refreshTokenId")
        .lean(),
      Message.aggregate([
        {
          $match: {
            receiverId: userId,
            seen: false,
          },
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ]),
    ])

    const unseenMessages = Object.fromEntries(
      filteredUser.map((user) => [user._id, 0]),
    )

    unseenMessageCounts.forEach(({ _id, count }) => {
      const senderId = _id.toString()
      if (Object.prototype.hasOwnProperty.call(unseenMessages, senderId)) {
        unseenMessages[senderId] = count
      }
    })

    res.status(200).json({
      users: filteredUser,
      unseenMessages: unseenMessages,
    })
  } catch (error) {
    console.error("Error fetching user for sidebar:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// get all messages for selected user (does NOT auto-mark-seen — use dedicated endpoint)
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 })

    res.status(200).json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// get unseen messages for reconnecting clients, with optional cursor
export const syncMessages = async (req, res) => {
  try {
    const userId = req.user._id

    // Guests do not have persisted messages
    if (req.user.isGuest) {
      return res.status(200).json([])
    }

    const after = req.query.after ? new Date(req.query.after) : new Date(0)

    const messages = await Message.find({
      receiverId: userId,
      createdAt: { $gt: after },
      $or: [
        { receiverDeletedAt: null },
        { receiverDeletedAt: { $exists: false } },
      ],
    }).sort({ createdAt: 1 })

    res.status(200).json(messages)
  } catch (error) {
    console.error("Error syncing messages:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// batch mark all messages from a sender as read
export const markConversationSeen = async (req, res) => {
  try {
    const { senderId } = req.params
    const receiverId = req.user._id
    const now = new Date()

    const result = await Message.updateMany(
      { senderId, receiverId, status: { $ne: "read" } },
      { $set: { seen: true, status: "read", readAt: now } },
    )

    if (result.modifiedCount > 0) {
      io.to(senderId.toString()).emit("messageSeen", {
        userId: receiverId.toString(),
      })
    }

    res.status(200).json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.error("Error marking conversation as seen:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// mark a single message as seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params
    const receiverId = req.user._id
    const now = new Date()

    const message = await Message.findOne({
      _id: messageId,
      receiverId,
      status: { $ne: "read" },
    })

    if (!message) {
      const existingMessage = await Message.findOne({
        _id: messageId,
        receiverId,
      })
      if (existingMessage) {
        return res.status(200).json(existingMessage)
      }
      return res
        .status(404)
        .json({ message: "Message not found or unauthorized." })
    }

    const senderId = message.senderId

    message.seen = true
    message.status = "read"
    message.readAt = now

    try {
      await message.save()
    } catch (saveErr) {
      if (saveErr.name === "VersionError") {
        const updated = await Message.findById(message._id)
        return res.status(200).json(updated)
      }
      throw saveErr
    }

    io.to(senderId.toString()).emit("messageSeen", {
      userId: receiverId.toString(),
      messageId: message._id.toString(),
    })

    res.status(200).json(message)
  } catch (error) {
    console.error("Error marking message as seen:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// send message to selected user with full state machine
export const sendMessage = async (req, res) => {
  try {
    const { text, image, clientId } = req.body
    const receiverId = req.params.receiverId
    const senderId = req.user._id
    const now = new Date()

    let imageUrl
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image)
      imageUrl = uploadedImage.secure_url
    }

    const isReceiverOnline = userSockets.has(receiverId.toString())

    const conversationId = [senderId.toString(), receiverId.toString()]
      .sort()
      .join(":")

    const newMessage = await Message.create({
      senderId,
      receiverId,
      conversationId,
      text,
      image: imageUrl || "",
      delivered: isReceiverOnline,
      status: isReceiverOnline ? "delivered" : "sent",
      sentAt: now,
      deliveredAt: isReceiverOnline ? now : null,
    })

    io.to(receiverId.toString()).emit("newMessage", {
      ...newMessage.toObject(),
      clientId,
    })

    io.to(senderId.toString()).emit("messageDelivered", {
      messageId: newMessage._id.toString(),
      status: newMessage.status,
      deliveredAt: newMessage.deliveredAt,
    })

    res.status(201).json({
      message: "Message sent successfully.",
      data: { ...newMessage.toObject(), clientId },
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const { text } = req.body
    const userId = req.user._id

    const message = await Message.findById(messageId)

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      })
    }

    if (message.deleted) {
      return res.status(400).json({
        message: "Deleted messages cannot be edited.",
      })
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized to edit this message.",
      })
    }

    message.text = text
    message.isEdited = true
    message.editedAt = new Date()

    await message.save()

    const receiverSocketId = userSockets.get(message.receiverId.toString())

    const senderSocketId = userSockets.get(message.senderId.toString())

    io.to(message.receiverId.toString()).emit("messageEdited", message)

    io.to(message.senderId.toString()).emit("messageEdited", message)

    res.status(200).json({
      message: "Message edited successfully.",
      data: message,
    })
  } catch (error) {
    console.error("Error editing message:", error)

    res.status(500).json({
      message: "Internal server error.",
    })
  }
}

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user._id

    const message = await Message.findById(messageId)

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
      })
    }

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "Unauthorized to delete this message.",
      })
    }

    message.deleted = true
    message.deletedAt = new Date()

    await message.save()

    const receiverSocketId = userSockets.get(message.receiverId.toString())

    const senderSocketId = userSockets.get(message.senderId.toString())

    io.to(message.receiverId.toString()).emit("messageDeleted", message)

    io.to(message.senderId.toString()).emit("messageDeleted", message)

    res.status(200).json({
      message: "Message deleted successfully.",
      data: message,
    })
  } catch (error) {
    console.error("Error deleting message:", error)

    res.status(500).json({
      message: "Internal server error.",
    })
  }
}

export const getMediaMessages = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user._id
    const limit = parseInt(req.query.limit) || 20
    const page = parseInt(req.query.page) || 1
    const skip = (page - 1) * limit

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
      image: { $ne: "", $exists: true },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalMedia = await Message.countDocuments({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
      image: { $ne: "", $exists: true },
    })

    res.status(200).json({
      messages,
      totalMedia,
      currentPage: page,
      totalPages: Math.ceil(totalMedia / limit),
    })
  } catch (error) {
    console.error("Error fetching media messages:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}
