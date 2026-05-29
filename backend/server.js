import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import Message from "./models/Message.js"
import { connectDB } from "./lib/db.js"
import swaggerSpec from "./lib/swagger.js"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import ChallengeRoom from "./models/ChallengeRoom.js"
import { Server } from "socket.io"
import { isVercel, parsePort, getPlatform } from "./lib/runtime.js"
import { registerTypingHandlers } from "./typingHandler.js"

const app = express()
const server = http.createServer(app)

const { CLIENT_URL, NODE_ENV, PORT } = process.env

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use(helmet())
app.use(cookieParser())

const standardLimiter =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window
        message: { error: "Too many requests, please try again later." },
        standardHeaders: true,
        legacyHeaders: false,
      })

const authLimiter =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // Stricter limit for auth/login routes
        message: {
          error: "Too many authentication attempts, please try again later.",
        },
        standardHeaders: true,
        legacyHeaders: false,
      })

// 1. Configure Allowed Origins
const allowedOrigins = [
  CLIENT_URL,
  // Add localhost for local development
  "http://localhost:3000",
  "http://localhost:5173", // Common Vite port, just in case
  "https://npm-chat-fxjq.vercel.app",
].filter(Boolean)

if (!CLIENT_URL && NODE_ENV === "production") {
  console.error(
    "ERROR: CLIENT_URL is not set. Set it to your frontend URL (e.g. https://your-frontend.example).",
  )
}

// 2. Configure CORS
const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error(`CORS blocked origin: ${origin}`))
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

// 3. Socket.IO Setup

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

export const userSockets = new Map() // userId -> Set<socketId>
export const userLastActive = new Map() // userId -> timestamp

// Socket rate limiting: max 20 concurrent connections per IP
const socketConnectionCounts = new Map()

io.use((socket, next) => {
  const ip = socket.handshake.address
  const count = socketConnectionCounts.get(ip) || 0

  if (count >= 20) {
    return next(new Error("Too many connections from this IP"))
  }

  socketConnectionCounts.set(ip, count + 1)

  socket.on("disconnect", () => {
    const curr = socketConnectionCounts.get(ip)
    if (curr && curr <= 1) {
      socketConnectionCounts.delete(ip)
    } else if (curr) {
      socketConnectionCounts.set(ip, curr - 1)
    }
  })

  next()
})

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token
  if (!token || token === "undefined" || token === "null") {
    return next(new Error("Authentication error: No token provided"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    socket.userId = decoded.id
    socket.isGuest = decoded.isGuest || false
    if (socket.isGuest) {
      socket.guestName = decoded.name
      socket.roomId = decoded.roomId
    }
    return next()
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new Error("Authentication error: Token expired"))
    }
    if (err.name === "JsonWebTokenError") {
      console.warn(`Socket auth token invalid: ${err.message}`)
    } else {
      console.error("Socket auth token invalid:", err.message)
    }
    return next(new Error("Authentication error: Invalid token"))
  }
})

// Periodic delivery sweep as fallback (every 15s)
setInterval(async () => {
  try {
    const undeliveredMessages = await Message.find({
      delivered: false,
      status: { $in: ["sent", "sending"] },
    })

    for (const msg of undeliveredMessages) {
      const now = new Date()
      msg.delivered = true
      msg.status = "delivered"
      msg.deliveredAt = now
      await msg.save()

      io.to(msg.senderId.toString()).emit("messageDelivered", {
        messageId: msg._id.toString(),
        status: "delivered",
        deliveredAt: now.toISOString(),
      })

      io.to(msg.receiverId.toString()).emit("newMessage", msg.toObject())
    }
  } catch (error) {
    console.error("Error during periodic delivery sweep:", error)
  }
}, 15000)

io.on("connection", async (socket) => {
  const userId = socket.userId
  const userIdStr = userId ? userId.toString() : ""

  if (userId) {
    if (!userSockets.has(userIdStr)) {
      userSockets.set(userIdStr, new Set())
    }
    userSockets.get(userIdStr).add(socket.id)
    userLastActive.set(userIdStr, Date.now())
    socket.join(userIdStr)
    socket.data.username = socket.isGuest ? socket.guestName : userIdStr
    socket.data.isGuest = socket.isGuest

    console.log(
      `User connected: ${userIdStr} (socket: ${socket.id}, isGuest: ${socket.isGuest})`,
    )

    // If guest, auto-join their specific room
    if (socket.isGuest && socket.roomId) {
      socket.join(socket.roomId)
      socket.to(socket.roomId).emit("userJoinedRoom", {
        userId: userIdStr,
        username: socket.data.username,
        isGuest: true,
      })
    }

    // Delivery sweep (only for registered users, guests don't have persistent messages)
    if (!socket.isGuest) {
      try {
        const undeliveredMessages = await Message.find({
          receiverId: userIdStr,
          delivered: false,
        })

        for (const msg of undeliveredMessages) {
          try {
            const now = new Date()
            msg.delivered = true
            msg.status = "delivered"
            msg.deliveredAt = now
            await msg.save()

            io.to(msg.senderId.toString()).emit("messageDelivered", {
              messageId: msg._id.toString(),
              status: "delivered",
              deliveredAt: now.toISOString(),
            })

            io.to(msg.receiverId.toString()).emit("newMessage", msg.toObject())
          } catch (saveErr) {
            if (saveErr.name === "VersionError") {
              continue
            }
            throw saveErr
          }
        }
      } catch (error) {
        console.error("Error during delivery sweep:", error)
      }
    }
  }

  // Register typing indicator handlers
  registerTypingHandlers(io, socket, userSockets)

  // Room Handlers
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId)
    console.log(`User ${userIdStr} joined room ${roomId}`)
    socket.to(roomId).emit("userJoinedRoom", {
      userId: userIdStr,
      username: socket.data.username,
      isGuest: socket.isGuest || false,
    })
  })

  socket.on("joinChallengeRoom", (challengeId) => {
    socket.join(`challenge_${challengeId}`)
    console.log(`User ${userIdStr} joined challenge room ${challengeId}`)
  })

  socket.on("leaveChallengeRoom", (challengeId) => {
    socket.leave(`challenge_${challengeId}`)
    console.log(`User ${userIdStr} left challenge room ${challengeId}`)
  })

  socket.on("challengeSubmission", async (data) => {
    const { challengeId } = data
    if (challengeId) {
      try {
        const challenge = await ChallengeRoom.findById(challengeId).populate(
          "submissions.userId",
          "name avatarUrl",
        )
        if (challenge) {
          io.to(`challenge_${challengeId}`).emit("leaderboardUpdate", {
            submissions: challenge.submissions,
          })
        }
      } catch (err) {
        console.error("Error fetching challenge leaderboard:", err)
      }
    }
  })

  socket.on("roomMessage", (data) => {
    // Ephemeral room message (not saved to DB)
    io.to(data.roomId).emit("newRoomMessage", {
      roomId: data.roomId,
      senderId: userIdStr,
      senderName: socket.data.username,
      isGuest: socket.isGuest || false,
      text: data.text,
      createdAt: new Date().toISOString(),
    })
  })

  socket.on("removeGuest", (data) => {
    // Only host should call this. Data = { roomId, guestId }
    // In a real app, verify this socket is the host of the room
    const targetSockets = userSockets.get(data.guestId)
    if (targetSockets) {
      targetSockets.forEach((socketId) => {
        const targetSocket = io.sockets.sockets.get(socketId)
        if (targetSocket) {
          targetSocket.leave(data.roomId)
          targetSocket.emit("removedFromRoom", { roomId: data.roomId })
        }
      })
    }
  })

  // Broadcast online users (unique user IDs with at least one active socket)
  io.emit("getOnlineUsers", Array.from(userSockets.keys()))

  socket.on("disconnect", () => {
    if (userId) {
      const sockets = userSockets.get(userIdStr)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          userSockets.delete(userIdStr)
        }
      }
      userLastActive.set(userIdStr, Date.now())
      console.log(`User disconnected: ${userIdStr} (socket: ${socket.id})`)
    }
    io.emit("getOnlineUsers", Array.from(userSockets.keys()))
  })
})

app.use(express.json({ limit: "4mb" }))

// 4. Routes with Rate Limiting applied
app.use("/api/status", (req, res) => {
  res.status(200).json({ status: "ok" })
})
app.use("/api/health", (req, res) => {
  if (NODE_ENV === "production") {
    return res.status(200).json({ status: "ok" })
  }
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    env: NODE_ENV || "development",
    platform: getPlatform(),
    nodeVersion: process.version,
    memory: process.memoryUsage(),
  })
})

import problemRouter from "./routes/problem.route.js"
import challengeRouter from "./routes/challenge.routes.js"

// Apply strict limiter to auth routes, and standard limiter to message routes
app.use("/api/v1/auth", authLimiter, userRouter)
app.use("/api/v1/messages", standardLimiter, messageRouter)
app.use("/api/v1/problems", standardLimiter, problemRouter)
app.use("/api/v1/challenges", standardLimiter, challengeRouter)

app.use("/", (req, res) => {
  res.send("NPMChat API is running")
})

// 5. Database Connection
if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      console.log("Connected to DB")
    })
    .catch((err) => {
      console.error("DB Connection Failed", err)
    })
}
import initCronJobs from "./lib/cron.js"

if (isVercel()) {
  console.log(
    "Running in Vercel Serverless environment. Skipping server.listen() and exporting Express app.",
  )
} else if (process.env.NODE_ENV !== "test") {
  const port = parsePort(process.env.PORT || 8080)
  server.listen(port, "0.0.0.0", () => {
    console.log(
      `Server is running on port ${port} in ${getPlatform()} environment`,
    )
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`)
    initCronJobs()
  })
}

// Export for potential use in integration tests (e.g., supertest)
export default app
