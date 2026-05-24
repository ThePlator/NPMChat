import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSockets } from "../server.js"

export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id // Get the user ID from the request object

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

// get all messages for slected user
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params // Get the userId from the request parameters
    const currentUserId = req.user._id // Get the current user's ID from the request object

    // Find messages between the current user and the selected user
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId },
      ],
    }).sort({ createdAt: 1 }) // Sort messages by creation date

    // Mark messages as seen if they are from the selected user
    const updateResult = await Message.updateMany(
      { senderId: userId, receiverId: currentUserId, seen: false },
      { $set: { seen: true } },
    )

    if (updateResult.modifiedCount > 0) {
      io.to(userId.toString()).emit("messageSeen", {
        userId: currentUserId.toString(),
      })
    }

    res.status(200).json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}

// api to mark messages as seen using messageId
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { messageId } = req.params // Get the messageId from the request parameters
    const receiverId = req.user._id

    // Safe flow: find the message first to get senderId and ensure it's for this receiver
    const message = await Message.findOne({
      _id: messageId,
      receiverId,
      seen: false,
    })

    if (!message) {
      // If already seen or not found, still return 200 if it belongs to this receiver
      const existingMessage = await Message.findOne({ _id: messageId, receiverId })
      if (existingMessage) {
        return res.status(200).json(existingMessage)
      }
      return res
        .status(404)
        .json({ message: "Message not found or unauthorized." })
    }

    const senderId = message.senderId

    message.seen = true
    try {
      await message.save()
    } catch (saveErr) {
      if (saveErr.name === "VersionError") {
        // Message was concurrently modified, fetch latest and return
        const updated = await Message.findById(message._id)
        return res.status(200).json(updated)
      }
      throw saveErr
    }

    // Notify the original sender
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

// send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body // Get the message text and image from the request body
    const receiverId = req.params.receiverId // Get the receiver's userId from the request parameter
    const senderId = req.user._id // Get the sender's userId from the

    let imageUrl
    if (image) {
      const uploadedImage = await cloudinary.uploader.upload(image)
      imageUrl = uploadedImage.secure_url // Get the secure URL of the uploaded image
    }

    const isReceiverOnline = userSockets.has(receiverId.toString())

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl || "",
      delivered: isReceiverOnline,
    })

    if (isReceiverOnline) {
      io.to(receiverId.toString()).emit("newMessage", newMessage) // Emit the new message to all receiver sockets

      io.to(senderId.toString()).emit("messageDelivered", {
        messageId: newMessage._id.toString(),
      })
    }

    res.status(201).json({
      message: "Message sent successfully.",
      data: newMessage,
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

    if (message.deleted) {
      return res.status(400).json({
        message: "Deleted messages cannot be edited.",
      })
    }

    if (!message) {
      return res.status(404).json({
        message: "Message not found.",
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

    const receiverSocketId =
      userSocketMap[message.receiverId]

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageEdited",
        message,
      )
    }

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

    const receiverSocketId =
      userSocketMap[message.receiverId]

    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "messageDeleted",
        message,
      )
    }

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
