import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    delivered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, optimisticConcurrency: true },
)

const Message = mongoose.model("Message", messageSchema)
export default Message
