import "dotenv/config"
import express from "express"
import cors from "cors"
import http from "http"
import helmet from "helmet"
import cookieParser from "cookie-parser"        // ✅ needed for httpOnly cookies
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"       // ✅ was in original
import swaggerSpec from "./lib/swagger.js"       // ✅ was in original
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import passport from "./lib/passport.js"         // ✅ your OAuth passport config
import { Server } from "socket.io"
import { isVercel, parsePort, getPlatform } from "./lib/runtime.js"
import { registerTypingHandlers } from "./typingHandler.js"

const app = express()
const server = http.createServer(app)

const { CLIENT_URL, NODE_ENV, PORT } = process.env

// ── Swagger docs ──────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// ── Security middleware ───────────────────────────────────────────
app.use(helmet())
app.use(cookieParser())                          // ✅ must be before routes

// ── Rate limiters ─────────────────────────────────────────────────
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
})


const allowedOrigins = [
  CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "https://npm-chat-fxjq.vercel.app",
].filter(Boolean)

if (!CLIENT_URL && NODE_ENV === "production") {
  console.error(
    "ERROR: CLIENT_URL is not set. Set it to your frontend URL (e.g. https://your-frontend.example).",
  )
}

const corsOptions = {
  origin(origin, callback) {
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

  io.emit("getOnlineUsers", Object.keys(userSocketMap))
  registerTypingHandlers(io, socket)

  socket.on("disconnect", () => {
    if (userId) {
      console.log(`User disconnected: ${userId}`)
      delete userSocketMap[userId]
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
  })
})


app.use(express.json({ limit: "4mb" }))
app.use(passport.initialize())                   


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


app.use("/api/v1/auth", authLimiter, userRouter)
app.use("/api/v1/messages", standardLimiter, messageRouter)

app.use("/", (req, res) => {
  res.send("NPMChat API is running")
})


if (NODE_ENV !== "test") {
  connectDB().then(() => {
    console.log("Connected to DB")
  }).catch((err) => {
    console.error("DB Connection Failed", err)
  })
}


if (isVercel()) {
  console.log("Running in Vercel Serverless environment. Skipping server.listen().")
} else if (NODE_ENV !== "test") {
  const port = parsePort(PORT || 8080)
  server.listen(port, () => {
    console.log(`Server is running on port ${port} in ${getPlatform()} environment`)
  })
}

export default app