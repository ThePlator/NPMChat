import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react"
import { api, getToken, addTokenRefreshListener, setOnlineStatus } from "./fetcher"
import { io, Socket } from "socket.io-client"
import { User, addSessionRestoreListener } from "./AuthContext"
import { toast } from "sonner"
import { generateClientId } from "../lib/utils"

export interface Message {
  _id: string
  clientId?: string
  text?: string
  senderId: string
  receiverId: string
  timestamp: string
  createdAt?: string
  seen: boolean
  delivered?: boolean
  image?: string
  isEdited?: boolean
  deleted?: boolean
  editedAt?: string
  deletedAt?: string
  status?: "sending" | "sent" | "delivered" | "read" | "failed"
  sentAt?: string
  deliveredAt?: string
  readAt?: string
}

export interface MessageContextType {
  users: User[]
  unseenMessages: Record<string, number>
  messages: Message[]
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
  fetchUsers: () => void
  fetchMessages: (userId: string) => void
  fetchMediaMessages: (
    userId: string,
    page?: number,
    limit?: number,
  ) => Promise<any>
  markAsSeen: (messageId: string) => Promise<any>
  markAllAsSeen: (senderId: string) => Promise<any>
  sendMessage: (
    receiverId: string,
    text: string,
    image?: string,
  ) => Promise<void>
  retrySendMessage: (message: Message) => Promise<void>
  loadingUsers: boolean
  loadingMessages: boolean
  error: string | null
  setError: (error: string | null) => void
  socket: Socket | null
  editMessage: (messageId: string, text: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<void>
  socketConnected: boolean
  socketError: string | null
  isSyncing: boolean
}

const MessageContext = createContext<MessageContextType | null>(null)

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
  currentUser: User | null
}) => {
  const [users, setUsers] = useState<User[]>([])
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const [unseenMessages, setUnseenMessages] = useState<Record<string, number>>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [socketConnected, setSocketConnected] = useState<boolean>(false)
  const [socketError, setSocketError] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const seenBatchRef = useRef<Map<string, number>>(new Map())
  const seenTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Connect to socket.io server
  useEffect(() => {
    if (!currentUser) return
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl && process.env.NODE_ENV === "production") {
      const msg = "NEXT_PUBLIC_API_URL is not set. Socket will attempt localhost:8080, which will fail in production."
      console.error(msg)
      setSocketError(msg)
      toast.error("Configuration error: backend URL is not set. Contact your administrator.", {
        id: "socket-config-error",
        duration: Infinity,
      })
      return
    }

    const resolvedUrl = apiUrl || "http://localhost:8080"
    const token = getToken()

    const socket = io(resolvedUrl, {
      transports: ["polling", "websocket"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on("connect", () => {
      setSocketConnected(true)
      setSocketError(null)
      setOnlineStatus(true)
      toast.success("Connected to chat server.", {
        id: "socket-success",
        duration: 2000,
      })
    })

    socket.on("connect_error", (err) => {
      const detail = err.message || String(err)
      console.error("WebSocket connection error:", detail, err)
      setSocketConnected(false)
      setSocketError(`Connection failed: ${detail}`)
      setOnlineStatus(false)
      toast.error(`Chat server unreachable: ${detail}.`, {
        id: "socket-error",
        duration: 5000,
      })
    })

    socket.on("disconnect", (reason) => {
      console.warn("WebSocket disconnected:", reason)
      setSocketConnected(false)
      setOnlineStatus(false)
    })

    socket.on("connect", async () => {
      setIsSyncing(true)
      try {
        const msgs = await api.get("/sync")
        if (msgs?.length) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id))
            const existingClientIds = new Set(prev.map((m) => m.clientId))
            const newMsgs = msgs.filter(
              (m: Message) =>
                !existingIds.has(m._id) &&
                !(m.clientId && existingClientIds.has(m.clientId)),
            )
            return [...prev, ...newMsgs]
          })
          fetchUsers()
        }
      } catch {
        // silent — sync is best-effort
      } finally {
        setIsSyncing(false)
      }
    })

    setSocket(socket)

    // Trigger sync on mount — covers the case where session restore listeners
    // fired before this effect's listener was registered (e.g. in tests where
    // mocked API calls resolve synchronously).
    const doSync = async () => {
      setIsSyncing(true)
      try {
        const msgs = await api.get("/sync")
        if (msgs?.length) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id))
            const newMsgs = msgs.filter((m: Message) => !existingIds.has(m._id))
            return [...prev, ...newMsgs]
          })
          fetchUsers()
        }
      } catch {
        // silent
      } finally {
        setIsSyncing(false)
      }
    }
    doSync()

    const unsubSession = addSessionRestoreListener(doSync)

    return () => {
      socket.disconnect()
      unsubSession()
    }
  }, [currentUser])

  // Sync socket with new tokens
  useEffect(() => {
    if (!socket) return
    const handleTokenRefresh = (newToken: string) => {
      socket.auth = { ...socket.auth, token: newToken }
      if (socket.connected) {
        socket.disconnect().connect()
      }
    }
    addTokenRefreshListener(handleTokenRefresh)
  }, [socket])

  const applyOnlineStatus = useCallback(
    (usersList: User[], onlineIds: string[]) => {
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

  const fetchUsers = useCallback(() => {
    if (!currentUser) return
    setLoadingUsers(true)
    api
      .get("/")
      .then((data) => {
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

  // Fetch messages for selected user
  const fetchMessages = useCallback(
    (userId: string) => {
      if (!userId) return
      setLoadingMessages(true)
      api
        .get(`/${userId}`)
        .then((msgs) => {
          setMessages(msgs)
          const anyUnseen = msgs.some(
            (msg: Message) =>
              !msg.seen && msg.receiverId === currentUser?.id,
          )
          if (anyUnseen) {
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

  const fetchMediaMessages = useCallback(
    async (userId: string, page = 1, limit = 20) => {
      if (!userId) return
      try {
        const data = await api.get(`/media/${userId}?page=${page}&limit=${limit}`)
        return data
      } catch (err: any) {
        setError(err.message || "Failed to load media messages")
        throw err
      }
    },
    [],
  )

  // Debounced batch seen-marking using conversation-level endpoint
  const markAllAsSeen = useCallback((senderId: string) => {
    seenBatchRef.current.set(senderId, Date.now())
    if (seenTimerRef.current) clearTimeout(seenTimerRef.current)
    seenTimerRef.current = setTimeout(() => {
      const entries = Array.from(seenBatchRef.current.entries())
      seenBatchRef.current.clear()
      entries.forEach(([sid]) => {
        setUnseenMessages((prev) => ({ ...prev, [sid]: 0 }))
        api.put(`/mark-conversation-seen/${sid}`).catch(() => {})
      })
    }, 300)
  }, [])

  const markAsSeen = useCallback(
    (messageId: string) => {
      const msg = messages.find((m: Message) => m._id === messageId)
      if (msg) {
        setUnseenMessages((prev) => ({ ...prev, [msg.senderId]: 0 }))
      }
      return api.put(`/mark-as-seen/${messageId}`)
    },
    [messages],
  )

  // Listen for socket events
  useEffect(() => {
    if (!socket) return

    const handleMessageSeen = (data: { userId: string; messageId?: string }) => {
      setUnseenMessages((prev) => ({ ...prev, [data.userId]: 0 }))
      if (data.messageId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, seen: true, delivered: true, status: "read" as const }
              : msg,
          ),
        )
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.receiverId === data.userId
              ? { ...msg, seen: true, delivered: true, status: "read" as const }
              : msg,
          ),
        )
      }
    }

    const handleMessageDelivered = (data: { messageId: string; status?: string; deliveredAt?: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? { ...msg, delivered: true, status: (data.status as Message["status"]) || "delivered", deliveredAt: data.deliveredAt }
            : msg,
        ),
      )
    }

    socket.on("messageSeen", handleMessageSeen)
    socket.on("messageDelivered", handleMessageDelivered)

    return () => {
      socket.off("messageSeen", handleMessageSeen)
      socket.off("messageDelivered", handleMessageDelivered)
    }
  }, [socket])

  // Send message with optimistic update, rollback, and retry
  const sendMessage = useCallback(
    async (receiverId: string, text: string, image?: string) => {
      if (!currentUser) return

      const clientId = generateClientId()
      const optimisticMessage: Message = {
        _id: clientId,
        clientId,
        senderId: currentUser.id,
        receiverId,
        text,
        image: image || undefined,
        seen: false,
        delivered: false,
        status: "sending",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, optimisticMessage])

      try {
        const body: { text: string; image?: string; clientId: string } = { text, clientId }
        if (image) body.image = image
        const res = await api.post(`/send/${receiverId}`, body)
        const newMessage = res.data

        setMessages((prev) =>
          prev.map((msg) =>
            msg.clientId === clientId ? { ...newMessage, clientId } : msg,
          ),
        )
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.clientId === clientId
              ? { ...msg, status: "failed" as const }
              : msg,
          ),
        )
        setError(err.message || "Failed to send message")
      }
    },
    [currentUser],
  )

  // Retry a failed message
  const retrySendMessage = useCallback(
    async (failedMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === failedMessage._id
            ? { ...msg, status: "sending" as const }
            : msg,
        ),
      )

      try {
        const body: { text: string; image?: string; clientId: string } = {
          text: failedMessage.text || "",
          clientId: failedMessage.clientId || failedMessage._id,
        }
        if (failedMessage.image) body.image = failedMessage.image
        const res = await api.post(`/send/${failedMessage.receiverId}`, body)
        const newMessage = res.data

        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === failedMessage._id
              ? { ...newMessage, clientId: failedMessage.clientId || failedMessage._id }
              : msg,
          ),
        )
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === failedMessage._id
              ? { ...msg, status: "failed" as const }
              : msg,
          ),
        )
        setError(err.message || "Retry failed")
      }
    },
    [],
  )

  const editMessage = useCallback(async (messageId: string, text: string) => {
    try {
      const res = await api.put(`/edit/${messageId}`, { text })
      const updatedMessage = res.data || res
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? updatedMessage : msg)),
      )
    } catch (err: any) {
      setError(err.message || "Failed to edit message")
    }
  }, [])

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const res = await api.delete(`/delete/${messageId}`)
      const deletedMessage = res.data || res
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? deletedMessage : msg)),
      )
    } catch (err: any) {
      setError(err.message || "Failed to delete message")
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    const handleMessageEdited = (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg,
        ),
      )
    }

    socket.on("messageEdited", handleMessageEdited)
    return () => { socket.off("messageEdited", handleMessageEdited) }
  }, [socket])

  useEffect(() => {
    if (!socket) return

    const handleMessageDeleted = (deletedMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === deletedMessage._id ? deletedMessage : msg,
        ),
      )
    }

    socket.on("messageDeleted", handleMessageDeleted)
    return () => { socket.off("messageDeleted", handleMessageDeleted) }
  }, [socket])

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return

    const handleMessage = (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.some(
          (m) => m._id === msg._id || (m.clientId && msg.clientId && m.clientId === msg.clientId),
        )
        if (exists) return prev
        return [...prev, msg]
      })
      fetchUsers()
    }

    socket.on("newMessage", handleMessage)
    return () => { socket.off("newMessage", handleMessage) }
  }, [socket])

  // Listen for online users
  useEffect(() => {
    if (!socket) return
    const handleGetOnlineUsers = (onlineUserIds: string[]) => {
      setOnlineUsers(onlineUserIds)
      setUsers((prevUsers: User[]) => {
        if (prevUsers.length === 0) return prevUsers
        return applyOnlineStatus(prevUsers, onlineUserIds)
      })
    }
    socket.on("getOnlineUsers", handleGetOnlineUsers)
    return () => { socket.off("getOnlineUsers", handleGetOnlineUsers) }
  }, [socket, applyOnlineStatus])

  // Auto-select first user
  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0])
    }
  }, [users, selectedUser])

  // Fetch messages on user select
  useEffect(() => {
    if (selectedUser) {
      const userId = selectedUser._id || selectedUser.id
      if (userId) fetchMessages(userId)
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
        fetchMediaMessages,
        markAsSeen,
        markAllAsSeen,
        sendMessage,
        retrySendMessage,
        loadingUsers,
        loadingMessages,
        error,
        setError,
        socket,
        socketConnected,
        socketError,
        editMessage,
        deleteMessage,
        isSyncing,
      }}
    >
      {children}
    </MessageContext.Provider>
  )
}
