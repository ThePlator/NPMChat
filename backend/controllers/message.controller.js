import Message from "../models/Message.js"
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js"
import { io, userSocketMap } from "../server.js"

export const getUserForSidebar = async (req, res) => {
  try {
    const userId = req.user._id // Get the user ID from the request object
    const filteredUser = await User.find({ _id: { $ne: userId } }).select(
      "-password",
    )

    const unseenMessages = {}

    const promises = filteredUser.map(async (user) => {
      const message = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false,
      })
      if (message.length > 0) {
        unseenMessages[user._id] = message.length
      } else {
        unseenMessages[user._id] = 0
      }
    })

    await Promise.all(promises)
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
    await Message.updateMany(
      { senderId: userId, receiverId: currentUserId, seen: false },
      { $set: { seen: true } },
    )

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
    // Update the message to mark it as seen
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true },
    )

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ message: "Message not found or already seen." })
    }

    res.status(200).json(updatedMessage)
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

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl || "",
    })

    const receiverSocketId = userSocketMap[receiverId] // Get the socket ID of the receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage) // Emit the new message to the receiver
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
