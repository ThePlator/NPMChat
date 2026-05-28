"use client"
import React, { useState, useEffect, useRef } from "react"
import { useAuth } from "../../app/AuthContext"
import { useMessageContext } from "../../app/MessageContext"
import { useRouter } from "next/navigation"

interface RoomMessage {
  roomId: string
  senderId: string
  senderName: string
  isGuest: boolean
  text: string
  createdAt: string
}

interface RoomUser {
  userId: string
  username: string
  isGuest: boolean
}

export default function RoomChatPanel({ roomId }: { roomId: string }) {
  const { user } = useAuth()
  const { socket } = useMessageContext()
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [input, setInput] = useState("")
  const [usersInRoom, setUsersInRoom] = useState<RoomUser[]>(
    user
      ? [
          {
            userId: user.id || "",
            username: user.name || "Guest",
            isGuest: user.isGuest || false,
          },
        ]
      : [],
  )
  const [showUpsell, setShowUpsell] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!socket) return

    // Announce presence
    socket.emit("joinRoom", roomId)

    const handleUserJoined = (data: RoomUser) => {
      setUsersInRoom((prev) => {
        if (prev.find((u) => u.userId === data.userId)) return prev
        return [...prev, data]
      })
    }

    const handleNewMessage = (msg: RoomMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => [...prev, msg])
      }
    }

    const handleRemoved = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        alert("You have been removed from this room by the host.")
        router.push("/chat")
      }
    }

    socket.on("userJoinedRoom", handleUserJoined)
    socket.on("newRoomMessage", handleNewMessage)
    socket.on("removedFromRoom", handleRemoved)

    return () => {
      socket.off("userJoinedRoom", handleUserJoined)
      socket.off("newRoomMessage", handleNewMessage)
      socket.off("removedFromRoom", handleRemoved)

      // If user is leaving, show upsell modal if they are a guest
      if (user?.isGuest) {
        setShowUpsell(true)
      }
    }
  }, [socket, roomId, router, user?.isGuest])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !socket) return

    socket.emit("roomMessage", { roomId, text: input })
    setInput("")
  }

  const handleRemoveUser = (guestId: string) => {
    if (socket && !user?.isGuest) {
      // Only host can remove
      socket.emit("removeGuest", { roomId, guestId })
    }
  }

  const handleLeaveRoom = () => {
    if (user?.isGuest) {
      setShowUpsell(true)
    } else {
      router.push("/chat")
    }
  }

  if (showUpsell) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-background rounded-2xl border-4 border-[#b39ddb] shadow-2xl w-full max-w-md p-8 text-center relative overflow-hidden">
          <h2 className="text-3xl font-extrabold mb-3 text-primary">
            Save your work!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Create a free account to persist your messages and collaborate
            permanently.
          </p>
          <button
            onClick={() => router.push("/signup")}
            className="w-full py-4 mb-4 bg-[#39ff14] hover:bg-[#b39ddb] text-black hover:text-white font-extrabold text-lg rounded-full border-2 border-black transition-all shadow-sm hover:scale-105"
          >
            Create a Free Account
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-accent hover:bg-gray-200 dark:hover:bg-gray-800 text-primary font-bold rounded-full border-2 border-sidebar-border transition-all"
          >
            Leave without saving
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen font-sans bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 text-black relative overflow-hidden">
      {/* Sidebar showing users */}
      <div className="w-full md:w-80 h-full border-r-2 border-sidebar-border bg-background flex flex-col hidden md:flex">
        <div className="p-5 border-b-2 border-sidebar-border bg-accent">
          <h2 className="font-extrabold text-2xl truncate text-primary">
            Room: {roomId}
          </h2>
          <p className="text-sm font-bold text-[#39ff14] uppercase tracking-wider mt-1">
            Ephemeral Session
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {usersInRoom.map((u) => (
            <div
              key={u.userId}
              className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent hover:border-[#b39ddb] hover:bg-accent transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#b39ddb] border-2 border-sidebar-border flex items-center justify-center font-extrabold text-lg text-black uppercase">
                  {u.username.charAt(0)}
                </div>
                <div>
                  <div className="font-extrabold text-base text-primary flex items-center gap-2">
                    {u.username}
                    {u.isGuest && (
                      <span className="bg-[#39ff14] text-black text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest border border-black shadow-sm">
                        Guest
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {!user?.isGuest && u.isGuest && (
                <button
                  onClick={() => handleRemoveUser(u.userId)}
                  className="text-xs font-bold bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors border border-black shadow-sm"
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 h-full flex flex-col relative bg-transparent">
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-sidebar-border bg-background sticky top-0 z-10">
          <div className="font-extrabold text-xl text-primary flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#39ff14] animate-pulse"></span>
            Live Chat
          </div>
          <button
            onClick={handleLeaveRoom}
            className="px-5 py-2 text-sm font-bold text-red-500 hover:text-white border-2 border-red-500 hover:bg-red-500 rounded-full transition-all shadow-sm"
          >
            Leave Room
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#f3e8ff]/80 dark:bg-accent/80 backdrop-blur-sm">
          <div className="text-center font-bold text-xs text-gray-500 dark:text-gray-400 my-4 uppercase tracking-widest bg-white/50 dark:bg-black/20 py-2 rounded-full mx-auto max-w-sm border border-sidebar-border">
            Ephemeral messages (Not Saved)
          </div>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id
            return (
              <div
                key={idx}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl border-2 font-medium text-base flex flex-col gap-1 shadow-sm ${isMe ? "bg-[#39ff14] text-black border-[#b39ddb] rounded-br-none items-end" : "bg-white text-black border-[#39ff14] rounded-bl-none items-start"}`}
                >
                  {!isMe && (
                    <div className="text-xs font-extrabold mb-1 opacity-60 flex items-center gap-2 text-black">
                      {msg.senderName}
                      {msg.isGuest && (
                        <span className="bg-black/10 px-1.5 rounded text-[10px] uppercase tracking-wider">
                          Guest
                        </span>
                      )}
                    </div>
                  )}
                  <span className="px-1 pb-1 pt-1 break-words text-base">
                    {msg.text}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="flex flex-col gap-0 border-t-2 border-sidebar-border px-2 py-2 bg-background sticky bottom-0 z-10 relative"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 border-2 border-sidebar-border rounded-full font-medium text-base bg-[#f3e8ff] dark:bg-accent text-primary focus:bg-white focus:outline-none focus:border-[#39ff14] placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[#39ff14] text-black text-base font-extrabold rounded-full border-2 border-sidebar-border transition-all duration-100 hover:bg-[#b39ddb] hover:text-white hover:scale-105 shadow-sm"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
