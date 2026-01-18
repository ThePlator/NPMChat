import express from "express"
import "dotenv/config"
import cors from "cors"
import http from "http"
import { connectDB } from "./lib/db.js"
import userRouter from "./routes/user.routes.js"
import messageRouter from "./routes/message.routes.js"
import { Server } from "socket.io"

const app = express()
const server = http.createServer(app)

const { CLIENT_URL, NODE_ENV, PORT } = process.env

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

// 4. Routes
app.use("/api/status", (req, res) => {
  res.status(200).json({ status: "ok" })
})
app.use("/api/v1/auth", userRouter)
app.use("/api/v1/messages", messageRouter)
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

// --- CRITICAL FIX FOR VERCEL ---

// Only run server.listen if we are LOCALLY developing.
// Vercel handles the server start automatically, so calling listen() there causes a timeout/crash.
if (NODE_ENV !== "production") {
  const port = PORT || 8080
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

// Export the Express 'app' so Vercel can turn it into a Serverless Function
export default app