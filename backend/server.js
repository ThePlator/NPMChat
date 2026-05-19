import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { Server } from "socket.io"
import { isVercel, parsePort, getPlatform } from "./lib/runtime.js"

const app = express()
const server = http.createServer(app)

const { CLIENT_URL, NODE_ENV, PORT } = process.env

app.use(helmet())

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
  "http://localhost:5173" // Common Vite port, just in case
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
// NOTE: This works locally. On Vercel, WebSocket connections often fail 
// because Vercel functions are serverless and do not keep connections open.
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
})

export const userSocketMap = {}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId

  if (userId) {
    userSocketMap[userId] = socket.id
    console.log(`User connected: ${userId}`)
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
// We wrap this so it doesn't crash the export if it takes time
connectDB().then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.error("DB Connection Failed", err);
});

// Start the HTTP server (required for Socket.IO WebSocket upgrade)
// Skip server.listen() in Vercel serverless environment to prevent hangs/timeouts
if (isVercel()) {
  console.log("Running in Vercel Serverless environment. Skipping server.listen() and exporting Express app.")
} else {
  const port = parsePort(PORT || 8080)
  server.listen(port, () => {
    console.log(`Server is running on port ${port} in ${getPlatform()} environment`)
  })
}

// Export for potential use in integration tests (e.g., supertest)
export default app