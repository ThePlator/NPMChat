"use client"
import React, { useRef, useEffect, useState } from "react"
import { useMessageContext } from "../../app/MessageContext"
import { useAuth } from "../../app/AuthContext"
import EmojiPicker from "emoji-picker-react"
import { ModeToggle } from "../ui/mode-toggle"

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
  } = useMessageContext()
  const { user } = useAuth()
  const [input, setInput] = useState("")
  const messageEndRef = useRef<HTMLDivElement | null>(null)
  const currentUserId = user?.id
  const [showEmoji, setShowEmoji] = useState(false)
  const [image, setImage] = useState<string | null>(null)
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

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
              <img
                src={selectedUser.avatarUrl || "/public/avatar.png"}
                alt={selectedUser.name}
                className="w-28 h-28 rounded-full border-4 border-[#b39ddb] object-cover shadow-md mb-3"
              />
              <span className="text-2xl font-extrabold text-black mb-1">
                {selectedUser.name}
              </span>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`w-3 h-3 rounded-full border-2 border-sidebar-border  ${
                    selectedUser.status === "online"
                      ? "bg-[#39ff14]"
                      : "bg-gray-400"
                  }`}
                ></span>
                <span
                  className={`text-sm font-bold ${
                    selectedUser.status === "online"
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
          className="w-10 h-10 rounded-full bg-[#b39ddb] flex items-center justify-center text-xl font-extrabold border-2 border-sidebar-border cursor-pointer hover:opacity-80"
          onClick={() => setShowUserDetails(true)}
          title="View profile"
        >
          {selectedUser && selectedUser.avatarUrl ? (
            <img
              src={selectedUser.avatarUrl}
              alt={selectedUser.name || "User"}
              className="w-full h-full object-cover rounded-full"
            />
          ) : selectedUser && selectedUser.name ? (
            selectedUser.name[0]
          ) : (
            "?"
          )}
        </div>
        <div className="flex justify-between w-full px-2">
          <div className="flex flex-col">
            <span
              className="text-lg font-extrabold text-primary cursor-pointer hover:text-[#39ff14]"
              onClick={() => setShowUserDetails(true)}
              title="View profile"
            >
              {selectedUser && selectedUser.name ? selectedUser.name : "User"}
            </span>
            <span
              className={`text-sm font-bold ${
                selectedUser && selectedUser.status === "online"
                  ? "text-[#39ff14]"
                  : "text-gray-400"
              }`}
            >
              {selectedUser && selectedUser.status === "online"
                ? "online"
                : "offline"}
            </span>
          </div>
          <ModeToggle />
        </div>
      </div>
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
              className={`flex w-full ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-xs md:max-w-md px-0 py-0 rounded-2xl border-2 font-medium text-base flex flex-col gap-1 shadow-sm
                ${
                  isMe
                    ? "bg-[#39ff14] text-black border-[#b39ddb] rounded-br-none items-end"
                    : "bg-white text-black border-[#39ff14] rounded-bl-none items-start"
                }`}
              >
                {msg.image && (
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
                {msg.text && (
                  <span className="px-4 pb-1 pt-1 break-words text-base text-black">
                    {msg.text}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-gray-500 mt-1 self-end pr-3 pb-1">
                  {time}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={messageEndRef} />
      </div>
      {/* Input */}
      <form
        className="flex items-center gap-2 border-t-2 border-sidebar-border  px-2 py-2 bg-background sticky bottom-0 z-10 relative"
        onSubmit={(e) => {
          e.preventDefault()
          handleSend()
        }}
      >
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
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border-2 border-sidebar-border  rounded-full font-medium text-base bg-[#f3e8ff] dark:bg-accent text-primary focus:bg-white focus:outline-none focus:border-[#39ff14] placeholder:text-gray-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#39ff14] text-black text-base font-bold rounded-full border-2 border-sidebar-border  transition-all duration-100 hover:bg-[#b39ddb] hover:text-white hover:scale-105 shadow-sm"
        >
          Send
        </button>
      </form>
      {loadingMessages && (
        <div className="p-4 text-center">Loading messages...</div>
      )}
      {error && <div className="p-4 text-center text-red-500">{error}</div>}
    </main>
  )
}
