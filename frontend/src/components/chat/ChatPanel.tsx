"use client"
import React, { useRef, useEffect, useState } from "react"
import { useMessageContext } from "../../app/MessageContext"
import { useAuth } from "../../app/AuthContext"
import { getInitials } from "../../lib/utils"
import { useTypingIndicator } from "../useTypingIndicator"
import { TypingIndicator } from "./TypingIndicator"

import EmojiPicker from "emoji-picker-react"
import { ModeToggle } from "../ui/mode-toggle"
import { Check, CheckCheck } from "lucide-react"
import { SettingsDrawer } from "../ui/settings-drawer"

function MessageTick({
  seen,
  delivered,
}: {
  seen?: boolean
  delivered?: boolean
}) {
  if (seen) {
    return <CheckCheck size={14} className="text-blue-500" aria-label="Seen" />
  }

  if (delivered) {
    return (
      <CheckCheck size={14} className="text-gray-400" aria-label="Delivered" />
    )
  }

  return <Check size={14} className="text-gray-400" aria-label="Sent" />
}

export default function ChatPanel({
  selectedUser,
  onBack,
}: {
  selectedUser: any
  onBack: () => void
}) {
  const {
    messages,
    sendMessage,
    markAsSeen,
    loadingMessages,
    error,
    selectedUser: contextSelectedUser,
    editMessage,
    deleteMessage,
  } = useMessageContext()

  const { user } = useAuth()
  const [input, setInput] = useState("")
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const currentUserId = user?.id
  const currentUsername = user?.name || ""
  const [showEmoji, setShowEmoji] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedText, setEditedText] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const { typingUsers, handleTyping } = useTypingIndicator(
    selectedUser?._id || "",
    currentUsername,
  )

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" })
  }, [messages, selectedUser])

  useEffect(() => {
    // Mark unseen messages as seen when displayed
    messages.forEach((msg: any) => {
      if (!msg.seen && msg.receiverId === currentUserId) {
        markAsSeen(msg._id)
      }
    })
    // eslint-disable-next-line
  }, [messages, selectedUser])

  async function handleSend() {
    if ((input.trim() === "" && !image) || !selectedUser) return
    await sendMessage(selectedUser._id, input, image || undefined)
    setInput("")
    setImage(null)
  }

  async function handleEdit(
    messageId: string,
  ) {
    if (!editedText.trim()) return

    await editMessage(
      messageId,
      editedText,
    )

    setEditingMessageId(null)
    setEditedText("")
  }

  async function handleDelete(
    messageId: string,
  ) {
    await deleteMessage(messageId)

    setShowDeleteConfirm(null)
  }

  function addEmoji(emoji: any) {
    setInput((prev) => prev + emoji.native)
    setShowEmoji(false)
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <main className="flex flex-col flex-1 h-full bg-white">
      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowUserDetails(false)}
        >
          <div
            className="bg-white rounded-2xl border-2 border-sidebar-border  shadow-lg p-0 flex flex-col items-center gap-0 relative min-w-[340px] max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-2xl font-bold text-black hover:text-[#39ff14]"
              onClick={() => setShowUserDetails(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="flex flex-col items-center w-full pt-8 pb-4 px-6">
              {selectedUser.avatarUrl ? (
                <img
                  src={selectedUser.avatarUrl}
                  alt={selectedUser.name}
                  className="w-28 h-28 rounded-full border-4 border-[#b39ddb] object-cover shadow-md mb-3"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-[#b39ddb] flex items-center justify-center text-4xl font-extrabold border-4 border-black shadow-md mb-3 select-none overflow-hidden">
                  <span className="text-black uppercase">
                    {getInitials(selectedUser.name)}
                  </span>
                </div>
              )}
              <span className="text-2xl font-extrabold text-black mb-1">
                {selectedUser.name}
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-3 h-3 rounded-full border-2 border-sidebar-border  ${selectedUser.status === "online"
                    ? "bg-[#39ff14]"
                    : "bg-gray-400"
                    }`}
                ></span>
                <span
                  className={`text-sm font-bold ${selectedUser.status === "online"
                    ? "text-[#39ff14]"
                    : "text-gray-400"
                    }`}
                >
                  {selectedUser.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="w-full border-t border-gray-200 my-2"></div>
              {selectedUser.bio && (
                <div className="w-full bg-[#f3e8ff] border border-[#b39ddb] rounded-lg px-4 py-2 text-center text-gray-700 text-base mt-2">
                  {selectedUser.bio}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setEnlargedImage(null)}
        >
          <div className="relative">
            <img
              src={enlargedImage}
              alt="enlarged"
              className="max-w-[90vw] max-h-[80vh] rounded-lg border-4 border-white shadow-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white border border-sidebar-border  rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
              onClick={(e) => {
                e.stopPropagation()
                setEnlargedImage(null)
              }}
              aria-label="Close image"
            >
              ×
            </button>
            <a
              href={enlargedImage}
              download="image.jpg"
              className="absolute bottom-2 right-2 bg-white border border-sidebar-border  rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
              onClick={(e) => e.stopPropagation()}
              aria-label="Download image"
            >
              ⬇️
            </a>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-sidebar-border bg-background sticky top-0 z-10">
        {/* Back button for mobile */}
        <button
          className="md:hidden mr-2 p-2 rounded-full border-2 border-sidebar-border bg-[#b39ddb] hover:bg-[#39ff14] focus:outline-none"
          onClick={onBack}
          aria-label="Back to user list"
          tabIndex={-1}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div
          className="w-10 h-10 rounded-full bg-[#b39ddb] flex items-center justify-center text-lg font-extrabold border-2 border-sidebar-border cursor-pointer hover:opacity-80 select-none overflow-hidden"
          onClick={() => setShowUserDetails(true)}
          title="View profile"
        >
          {selectedUser && selectedUser.avatarUrl ? (
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-black uppercase">
              {getInitials(selectedUser?.name)}
            </span>
          )}
        </div>
        <div className="flex justify-between w-full px-2">
          <div className="flex flex-col">
            <span
              className="text-lg font-extrabold text-primary cursor-pointer hover:text-[var(--color-neon-green)]"
              onClick={() => setShowUserDetails(true)}
              title="View profile"
            >
              {selectedUser && selectedUser.name ? selectedUser.name : "User"}
            </span>
            <span
              className={`text-sm font-bold ${selectedUser && selectedUser.status === "online"
                ? "text-[var(--color-neon-green)]"
                : "text-gray-400"
                }`}
            >
              {selectedUser && selectedUser.status === "online"
                ? "online"
                : "offline"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-full border-2 border-sidebar-border bg-accent hover:bg-[#b39ddb] focus:outline-none"
              aria-label="Open settings"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <ModeToggle />
          </div>
        </div>
      </div>
      <SettingsDrawer isOpen={showSettings} onClose={() => setShowSettings(false)} />
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f3e8ff] dark:bg-accent">
        {messages.map((msg: any, i: number) => {
          const isMe = msg.senderId === currentUserId
          // Format time from createdAt or timestamp
          let time = ""
          const timeSource = msg.createdAt || msg.timestamp
          if (timeSource) {
            const date = new Date(timeSource)
            time = date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
          return (
            <div
              key={msg._id || i}
              className={`flex w-full ${isMe ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`group relative max-w-xs md:max-w-md px-0 py-0 rounded-2xl border-2 font-medium text-base flex flex-col gap-1 shadow-sm
                ${isMe
                    ? "bg-[#39ff14] text-black border-[#b39ddb] rounded-br-none items-end"
                    : "bg-white text-black border-[#39ff14] rounded-bl-none items-start"
                  }`}
              >
                {isMe && !msg.deleted && (
                  <div className="absolute -top-8 right-0 hidden group-hover:flex gap-2 bg-white border rounded-lg px-2 py-1 shadow z-10">

                    {msg.text && (
                      <button
                        onClick={() => {
                          setEditingMessageId(msg._id)
                          setEditedText(msg.text)
                        }}
                        className="text-sm hover:text-blue-500"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setShowDeleteConfirm(msg._id)
                      }
                      className="text-sm hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                )}
                {msg.image && !msg.deleted && (
                  <div className="relative group rounded-xl overflow-hidden m-2">
                    <img
                      src={msg.image}
                      alt="preview"
                      className="w-60 h-60 object-cover rounded-xl border border-black cursor-pointer hover:opacity-90 transition"
                      onClick={() => setEnlargedImage(msg.image)}
                      style={{
                        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
                      }}
                    />
                    <a
                      href={msg.image}
                      download="image.jpg"
                      className="absolute bottom-2 right-2 bg-white/80 border border-black rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold opacity-80 hover:opacity-100 transition"
                      onClick={(e) => e.stopPropagation()}
                      title="Download image"
                    >
                      ⬇️
                    </a>
                  </div>
                )}
                {editingMessageId === msg._id ? (
                  <div className="flex gap-2 px-3 py-2">
                    <input
                      value={editedText}
                      onChange={(e) =>
                        setEditedText(e.target.value)
                      }
                      className="border px-2 py-1 rounded flex-1"
                    />

                    <button
                      onClick={() => handleEdit(msg._id)}
                      className="text-sm font-bold text-blue-500"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingMessageId(null)
                        setEditedText("")
                      }}
                      className="text-sm font-bold text-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-4 pb-1 pt-1 break-words text-base ${msg.deleted
                      ? "italic text-gray-500"
                      : "text-black"
                      }`}
                  >
                    {msg.deleted
                      ? "This message was deleted"
                      : msg.text}
                    {msg.isEdited && !msg.deleted && (
                      <span className="ml-2 text-xs italic text-gray-500">
                        (edited)
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-500 mt-1 self-end pr-3 pb-1">
                  {time}
                  {isMe && (
                    <MessageTick
                      seen={msg.seen}
                      delivered={msg.delivered ?? false}
                    />
                  )}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messageEndRef} />
      </div>
      {/* Input */}
      <form
        className="flex flex-col gap-0 border-t-2 border-sidebar-border  px-2 py-2 bg-background sticky bottom-0 z-10 relative"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-2 text-xl border-2 border-sidebar-border  rounded-full bg-accent  hover:bg-[#b39ddb]"
            onClick={() => setShowEmoji((v) => !v)}
            aria-label="Add emoji"
          >
            😊
          </button>
          {showEmoji && (
            <div className="absolute bottom-14 left-0 z-50">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setInput((prev) => prev + emojiData.emoji)
                  setShowEmoji(false)
                }}
              />
            </div>
          )}
          <label
            className="px-2 py-2 cursor-pointer border-2 border-sidebar-border rounded-full bg-accent hover:bg-[#b39ddb] flex items-center justify-center"
            title="Attach image"
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
            <span role="img" aria-label="Attach">
              📎
            </span>
          </label>
          {image && (
            <div className="relative flex items-center">
              <img
                src={image}
                alt="preview"
                className="w-12 h-12 object-cover rounded border-2 border-sidebar-border  mr-2"
              />
              <button
                type="button"
                className="absolute top-0 right-0 bg-white border border-sidebar-border  rounded-full w-5 h-5 flex items-center justify-center text-xs"
                onClick={() => setImage(null)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border-2 border-sidebar-border  rounded-full font-medium text-base bg-[#f3e8ff] dark:bg-accent text-primary focus:bg-white focus:outline-none focus:border-[#39ff14] placeholder:text-gray-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#39ff14] text-black text-base font-bold rounded-full border-2 border-sidebar-border  transition-all duration-100 hover:bg-[#b39ddb] hover:text-white hover:scale-105 shadow-sm"
          >
            Send
          </button>
        </div>
      </form>
      {loadingMessages && (
        <div className="p-4 text-center">Loading messages...</div>
      )}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl border shadow-lg">
            <p className="mb-4 font-semibold">
              Delete this message?
            </p>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() =>
                  setShowDeleteConfirm(null)
                }
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  handleDelete(showDeleteConfirm)
                }
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
