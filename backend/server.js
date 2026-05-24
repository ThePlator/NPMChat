import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import helmet from "helmet"
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"
import rateLimit from "express-rate-limit"
import Message from "./models/Message.js"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { Server } from "socket.io"
import { isVercel, parsePort, getPlatform } from "./lib/runtime.js"

const app = express()
const server = http.createServer(app)

const { CLIENT_URL, NODE_ENV, PORT } = process.env

app.use(helmet())
app.use(cookieParser())

const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Stricter limit for auth/login routes
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

// 1. Configure Allowed Origins
const allowedOrigins = [
  CLIENT_URL,
  // Add localhost for local development
  "http://localhost:3000",
  "http://localhost:5173", // Common Vite port, just in case
  "https://npm-chat-fxjq.vercel.app"
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
})

export const userSocketMap = {}

io.use(async (socket, next) => {
  const token = socket.handshake.auth.token
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id
      return next()
    } catch (err) {
      console.error("Socket auth token invalid:", err.message)
    }
  }

  // Fallback to query.userId for compatibility
  const userId = socket.handshake.query.userId
  if (userId) {
    socket.userId = userId
    return next()
  }

  next(new Error("Authentication error: No token or userId provided"))
})

io.on("connection", async (socket) => {
  const userId = socket.userId

  if (userId) {
    userSocketMap[userId] = socket.id
    console.log(`User connected: ${userId}`)

    // Delivery sweep
    try {
      const undeliveredMessages = await Message.find({
        receiverId: userId,
        delivered: false,
      })

      for (const msg of undeliveredMessages) {
        msg.delivered = true
        await msg.save()

        const senderSocketId = userSocketMap[msg.senderId.toString()]
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageDelivered", {
            messageId: msg._id.toString(),
          })
        }
      }
    } catch (error) {
      console.error("Error during delivery sweep:", error)
    }
  }

  // Broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap))

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User disconnected: ${userId}`)
      delete userSocketMap[userId]
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
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

// Apply strict limiter to auth routes, and standard limiter to message routes
app.use("/api/v1/auth", authLimiter, userRouter)
app.use("/api/v1/messages", standardLimiter, messageRouter)

app.use("/", (req, res) => {
  res.send("NPMChat API is running")
})

// 5. Database Connection
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    console.log("Connected to DB");
  }).catch(err => {
    console.error("DB Connection Failed", err);
  });
}
if (isVercel()) {
  console.log("Running in Vercel Serverless environment. Skipping server.listen() and exporting Express app.");
} else if (process.env.NODE_ENV !== "test") {
  const port = parsePort(process.env.PORT || 8080);
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port} in ${getPlatform()} environment`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(", ")}`);
  });
}

// Export for potential use in integration tests (e.g., supertest)
export default app