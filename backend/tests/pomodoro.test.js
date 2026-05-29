import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { createServer } from "http"
import { Server } from "socket.io"
import { io as Client } from "socket.io-client"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

describe("Pomodoro Socket Events", () => {
  let io, serverSocket, clientSocket, server
  const port = 50000 + Math.floor(Math.random() * 10000)

  beforeEach(async () => {
    server = createServer()
    io = new Server(server)

    // Replicate server.js pomodoro logic
    const roomTimers = new Map()

    io.use((socket, next) => {
      const token = socket.handshake.auth?.token
      if (!token) return next(new Error("No token"))
      try {
        const decoded = jwt.verify(token, "testsecret")
        socket.userId = decoded.id
        socket.isGuest = decoded.isGuest || false
        next()
      } catch (err) {
        next(new Error("Invalid token"))
      }
    })

    io.on("connection", (socket) => {
      serverSocket = socket

      socket.on("joinRoom", (roomId) => {
        socket.join(roomId)
        const timer = roomTimers.get(roomId)
        if (timer) {
          socket.emit("pomodoroTick", { timeLeft: timer.timeLeft, state: timer.state, type: timer.type })
        }
      })

      socket.on("pomodoroAction", (data) => {
        if (socket.isGuest) return
        const { roomId, action, type } = data
        let timer = roomTimers.get(roomId)

        if (action === "start") {
          if (!timer || timer.state === "idle") {
            timer = { timeLeft: type === "focus" ? 25 * 60 : 5 * 60, state: "active", type, intervalId: null }
            roomTimers.set(roomId, timer)
          } else if (timer.state === "paused") {
            timer.state = "active"
            timer.type = type
          }
          if (!timer.intervalId) {
            timer.intervalId = setInterval(() => {
              timer.timeLeft--
              if (timer.timeLeft <= 0) {
                clearInterval(timer.intervalId)
                timer.intervalId = null
                timer.state = "idle"
              }
              io.to(roomId).emit("pomodoroTick", { timeLeft: timer.timeLeft, state: timer.state, type: timer.type })
            }, 1000)
          }
          io.to(roomId).emit("pomodoroTick", { timeLeft: timer.timeLeft, state: timer.state, type: timer.type })
        } else if (action === "pause") {
          if (timer && timer.intervalId) {
            clearInterval(timer.intervalId)
            timer.intervalId = null
            timer.state = "paused"
            io.to(roomId).emit("pomodoroTick", { timeLeft: timer.timeLeft, state: timer.state, type: timer.type })
          }
        } else if (action === "reset") {
          if (timer) {
            if (timer.intervalId) clearInterval(timer.intervalId)
            roomTimers.delete(roomId)
          }
          io.to(roomId).emit("pomodoroTick", { timeLeft: type === "focus" ? 25 * 60 : 5 * 60, state: "idle", type })
        }
      })
    })

    await new Promise((resolve) => {
      server.listen(port, () => {
        const token = jwt.sign({ id: new mongoose.Types.ObjectId().toString(), isGuest: false }, "testsecret")
        clientSocket = Client(`http://localhost:${port}`, { auth: { token } })
        clientSocket.on("connect", resolve)
      })
    })
  })

  afterEach(() => {
    io.close()
    if (clientSocket) clientSocket.close()
    server.close()
  })

  it("should handle start, pause, and reset", () => new Promise((done) => {
    let tickCount = 0
    clientSocket.emit("joinRoom", "room1")

    clientSocket.on("pomodoroTick", (data) => {
      tickCount++
      if (tickCount === 1) {
        expect(data.state).toBe("active")
        expect(data.type).toBe("focus")
        expect(data.timeLeft).toBe(25 * 60)
        // test pause
        clientSocket.emit("pomodoroAction", { roomId: "room1", action: "pause", type: "focus" })
      } else if (tickCount === 2) {
        expect(data.state).toBe("paused")
        // test reset
        clientSocket.emit("pomodoroAction", { roomId: "room1", action: "reset", type: "focus" })
      } else if (tickCount === 3) {
        expect(data.state).toBe("idle")
        done()
      }
    })

    clientSocket.emit("pomodoroAction", { roomId: "room1", action: "start", type: "focus" })
  }))
})
