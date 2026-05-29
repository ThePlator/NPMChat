"use client"

import { useEffect, useRef, useState } from "react"
import { useMessageContext } from "@/app/MessageContext"
import { Socket } from "socket.io-client"

export function useTypingIndicator(
  selectedUserId: string,
  currentUsername: string,
) {
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const stopTypingTimer = useRef<NodeJS.Timeout | null>(null)
  const isTyping = useRef(false)

  let socket: Socket | null = null
  try {
    const context = useMessageContext()
    socket = context?.socket || null
  } catch {
    // Fail silently if used outside context
  }

  // Emit typing on keypress
  const handleTyping = () => {
    if (!socket || !selectedUserId || !currentUsername) return

    if (!isTyping.current) {
      isTyping.current = true
      socket.emit("typing", {
        roomId: selectedUserId,
        username: currentUsername,
      })
    }

    // Debounce: emit stop_typing after 1.5s of no keypresses
    if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
    stopTypingTimer.current = setTimeout(() => {
      socket.emit("stop_typing", {
        roomId: selectedUserId,
        username: currentUsername,
      })
      isTyping.current = false
    }, 1500)
  }

  // Reset typing state and clear typing users when room changes
  useEffect(() => {
    setTypingUsers([])
    isTyping.current = false
    if (stopTypingTimer.current) {
      clearTimeout(stopTypingTimer.current)
      stopTypingTimer.current = null
    }
  }, [selectedUserId])

  // Clear stale typing on reconnect
  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      setTypingUsers([])
    }

    socket.on("connect", handleConnect)

    return () => {
      socket.off("connect", handleConnect)
    }
  }, [socket])

  // Listen for other users typing
  useEffect(() => {
    if (!socket) return

    const handleUserTyping = ({
      username: typingUser,
    }: {
      username: string
    }) => {
      setTypingUsers((prev) =>
        prev.includes(typingUser) ? prev : [...prev, typingUser],
      )
    }

    const handleUserStoppedTyping = ({
      username: stoppedUser,
    }: {
      username: string
    }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== stoppedUser))
    }

    socket.on("user_typing", handleUserTyping)
    socket.on("user_stopped_typing", handleUserStoppedTyping)

    return () => {
      socket.off("user_typing", handleUserTyping)
      socket.off("user_stopped_typing", handleUserStoppedTyping)
    }
  }, [socket, selectedUserId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current)
    }
  }, [])

  return { typingUsers, handleTyping }
}
