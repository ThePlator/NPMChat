import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { api } from "./fetcher"
import { io, Socket } from "socket.io-client"
import { User } from "./AuthContext" // CHANGED: imported User interface
import { toast } from "sonner" // ADDED: sonner for notifications

export interface Message { // CHANGED: Added Message interface
  _id: string;
  text?: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  seen: boolean;
  image?: string;
}

export interface MessageContextType { // CHANGED: Added MessageContextType
  users: User[];
  unseenMessages: Record<string, number>;
  messages: Message[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  fetchUsers: () => void;
  fetchMessages: (userId: string) => void;
  markAsSeen: (messageId: string) => Promise<any>;
  sendMessage: (receiverId: string, text: string, image?: string) => Promise<void>;
  loadingUsers: boolean;
  loadingMessages: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  socket: Socket | null;
  socketConnected: boolean;
  socketError: string | null;
}

const MessageContext = createContext<MessageContextType | null>(null) // CHANGED: Use MessageContextType instead of any

export function useMessageContext() {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider")
  }
  return context
}

export const MessageProvider = ({
  children,
  currentUser,
}: {
  children: React.ReactNode
  currentUser: User | null // CHANGED: Use User type instead of any
}) => {
  const [users, setUsers] = useState<User[]>([]) // CHANGED: Use User[] instead of any[]
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>(
    {},
  )
  const [messages, setMessages] = useState<Message[]>([]) // CHANGED: Use Message[] instead of any[]
  const [selectedUser, setSelectedUser] = useState<User | null>(null) // CHANGED: Use User instead of any
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [socketConnected, setSocketConnected] = useState<boolean>(false)
  const [socketError, setSocketError] = useState<string | null>(null)

  // Connect to socket.io server with userId as query param
  useEffect(() => {
    if (!currentUser) return
    const userId = currentUser.id

    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl && process.env.NODE_ENV === "production") {
      const msg =
        "NEXT_PUBLIC_API_URL is not set. Socket will attempt localhost:8080, which will fail in production."

      console.error(msg)
      setSocketError(msg)

      toast.error(
        "Configuration error: backend URL is not set. Contact your administrator.",
        {
          id: "socket-config-error",
          duration: Infinity,
        }
      )

      return
    }

    const resolvedUrl = apiUrl || "http://localhost:8080"

    const socket = io(resolvedUrl, {
      transports: ["polling", "websocket"],
      query: { userId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on("connect", () => {
      console.log("WebSocket connected successfully")
      setSocketConnected(true)
      setSocketError(null)

      toast.success("Connected to chat server.", {
        id: "socket-success",
        duration: 2000,
      })
    })

    socket.on("connect_error", (err) => {
      const detail = err.message || String(err)
      const description =
        (err as any).description ? ` (${(err as any).description})` : ""

      console.error("WebSocket connection error:", detail + description, err)

      setSocketConnected(false)
      setSocketError(`Connection failed: ${detail}`)

      toast.error(
        `Chat server unreachable: ${detail}. Check NEXT_PUBLIC_API_URL or backend status.`,
        {
          id: "socket-error",
          duration: 5000,
        }
      )
    })

    socket.on("disconnect", (reason) => {
      console.warn("WebSocket disconnected:", reason)
      setSocketConnected(false)
    })

    setSocket(socket)
    return () => {
      socket.disconnect()
    }
  }, [currentUser])

  // helper to update the online statuses
  const applyOnlineStatus = useCallback(
    (usersList: User[], onlineIds: string[]) => { // CHANGED: Use User[] instead of any[]
      return usersList.map((user) => {
        const userId = (user._id || user.id)?.toString()
        const isOnline = onlineIds.some(
          (onlineId) => onlineId.toString() === userId,
        )

        return {
          ...user,
          status: isOnline ? "online" : "offline",
        } as User
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
          msgs.forEach((msg: Message) => { // CHANGED: Use Message instead of any
            if (!msg.seen && msg.receiverId === currentUser?.id) {
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
      const msg = messages.find((m: Message) => m._id === messageId) // CHANGED: Use Message instead of any
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
      if (!currentUser) return
      try {
        const body: { text: string; image?: string } = { text } // CHANGED: Removed any type from body object
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

        setMessages((msgs: Message[]) => [...msgs, newMessage]) // CHANGED: Use Message[] instead of any[]

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
    const handleMessage = (msg: Message) => { // CHANGED: Use Message instead of any
      // Check if message is for current chat
      if (
        selectedUser &&
        (msg.senderId === selectedUser._id ||
          msg.receiverId === selectedUser._id ||
          msg.senderId === selectedUser.id ||
          msg.receiverId === selectedUser.id)
      ) {
        setMessages((msgs: Message[]) => [...msgs, msg]) // CHANGED: Use Message[] instead of any[]
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
      setUsers((prevUsers: User[]) => { // CHANGED: Use User[] instead of any[]
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
        socketConnected,
        socketError,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}
