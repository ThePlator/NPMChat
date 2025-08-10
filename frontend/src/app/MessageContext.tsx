import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { api } from "./fetcher"
import { io, Socket } from "socket.io-client"

const MessageContext = createContext<any>(null)

export function useMessageContext() {
  return useContext(MessageContext)
}

export const MessageProvider = ({
  children,
  currentUser,
}: {
  children: React.ReactNode
  currentUser: any
}) => {
  const [users, setUsers] = useState<any[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
    {},
  )
  const [messages, setMessages] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Connect to socket.io server with userId as query param
  useEffect(() => {
    if (!currentUser) return
    const userId = currentUser.id
    const socket = io("http://localhost:8080", {
      transports: ["websocket"],
      query: { userId },
    })
    setSocket(socket)
    return () => {
      socket.disconnect()
    }
  }, [currentUser])

  // helper to update the online statuses
  const applyOnlineStatus = useCallback(
    (usersList: any[], onlineIds: string[]) => {
      return usersList.map((user) => {
        const userId = (user._id || user.id)?.toString()
        const isOnline = onlineIds.some(
          (onlineId) => onlineId.toString() === userId,
        )

        return {
          ...user,
          status: isOnline ? "online" : "offline",
        }
      })
    },
    [],
  )

  // Fetch users for sidebar
  const fetchUsers = useCallback(() => {
    if (!currentUser) return
    setLoadingUsers(true)
    api
      .get("/")
      .then((data) => {
        // API returns { users: [...], unseenMessages: { ... } }
        const usersWithStatus = applyOnlineStatus(data.users, onlineUsers)
        setUsers(usersWithStatus)
        setUnseenMessages(data.unseenMessages || {})
      })
      .catch((err) => setError(err.message || "Failed to load users"))
      .finally(() => setLoadingUsers(false))
  }, [currentUser, onlineUsers, applyOnlineStatus])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Fetch messages for selected user (marks unseen as seen)
  const fetchMessages = useCallback(
    (userId: string) => {
      if (!userId) return
      setLoadingMessages(true)
      api
        .get(`/${userId}`)
        .then((msgs) => {
          setMessages(msgs)
          // Mark unseen messages as seen (for current user)
          let anySeen = false
          msgs.forEach((msg: any) => {
            if (!msg.seen && msg.receiverId === currentUser.id) {
              markAsSeen(msg._id)
              anySeen = true
            }
          })
          // If any messages were seen, update unseenMessages for this user
          if (anySeen) {
            setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }))
          }
        })
        .catch((err) => {
          setError(err.message || "Failed to load messages")
        })
        .finally(() => setLoadingMessages(false))
    },
    [currentUser],
  )

  // Mark messages as seen (API: PUT /mark-as-seen/:messageId)
  const markAsSeen = useCallback(
    (messageId: string) => {
      // Find the userId for this message
      const msg = messages.find((m: any) => m._id === messageId)
      if (msg) {
        setUnseenMessages((prev) => ({ ...prev, [msg.senderId]: 0 }))
      }
      return api.put(`/mark-as-seen/${messageId}`)
    },
    [messages],
  )

  // Listen for messageSeen socket event to update unseenMessages in real time
  useEffect(() => {
    if (!socket) return
    const handleMessageSeen = (data: { userId: string }) => {
      setUnseenMessages((prev) => ({ ...prev, [data.userId]: 0 }))
    }
    socket.on("messageSeen", handleMessageSeen)
    return () => {
      socket.off("messageSeen", handleMessageSeen)
    }
  }, [socket])

  // Send message (API: POST /send/:receiverId)
  const sendMessage = useCallback(
    async (receiverId: string, text: string, image?: string) => {
      try {
        const body: any = { text }
        if (image) body.image = image
        const res = await api.post(`/send/${receiverId}`, body)

        // Handle different possible response structures
        let messageData
        if (res.data) {
          messageData = res.data
        } else if (res.message) {
          messageData = res
        } else {
          messageData = res
        }

        // Ensure the message has required fields
        const newMessage = {
          _id: messageData._id || Date.now().toString(),
          text: messageData.text || text,
          senderId: currentUser.id,
          receiverId: receiverId,
          timestamp: messageData.timestamp || new Date().toISOString(),
          seen: messageData.seen || false,
          ...(messageData.image && { image: messageData.image }),
        }

        setMessages((msgs: any[]) => [...msgs, newMessage])

        // Also emit via socket for real-time
        if (socket) {
          socket.emit("send-message", newMessage)
        }
      } catch (err: any) {
        setError(err.message || "Failed to send message")
      }
    },
    [currentUser, socket],
  )

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return
    const handleMessage = (msg: any) => {
      // Check if message is for current chat
      if (
        selectedUser &&
        (msg.senderId === selectedUser._id ||
          msg.receiverId === selectedUser._id ||
          msg.senderId === selectedUser.id ||
          msg.receiverId === selectedUser.id)
      ) {
        setMessages((msgs: any[]) => [...msgs, msg])
      }

      // Update unseen counts
      fetchUsers()
    }
    socket.on("newMessage", handleMessage)
    return () => {
      socket.off("newMessage", handleMessage)
    }
  }, [socket, selectedUser, fetchUsers])

  // Listen for online users list and update user statuses
  useEffect(() => {
    if (!socket) return
    const handleGetOnlineUsers = (onlineUserIds: string[]) => {
      setOnlineUsers(onlineUserIds)
      setUsers((prevUsers: any[]) => {
        if (prevUsers.length === 0) {
          console.log("No users loaded yet")
          return prevUsers
        }
        return applyOnlineStatus(prevUsers, onlineUserIds)
      })
    }
    socket.on("getOnlineUsers", handleGetOnlineUsers)
    return () => {
      socket.off("getOnlineUsers", handleGetOnlineUsers)
    }
  }, [socket, applyOnlineStatus])

  // Automatically select the first user if none is selected and users are loaded
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0])
    }
  }, [users, selectedUser])

  // Fetch messages when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      const userId = selectedUser._id || selectedUser.id
      if (userId) {
        fetchMessages(userId)
      }
    }
  }, [selectedUser, fetchMessages])

  return (
    <MessageContext.Provider
      value={{
        users,
        unseenMessages,
        messages,
        selectedUser,
        setSelectedUser,
        fetchUsers,
        fetchMessages,
        markAsSeen,
        sendMessage,
        loadingUsers,
        loadingMessages,
        error,
        setError,
        socket,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}
