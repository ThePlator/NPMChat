const typingUsers = new Map() // roomId -> Map<username, lastTypingAt>

const TYPING_TIMEOUT = 10000

setInterval(() => {
  const now = Date.now()
  for (const [roomId, users] of typingUsers) {
    for (const [username, lastTypingAt] of users) {
      if (now - lastTypingAt > TYPING_TIMEOUT) {
        users.delete(username)
        io?.to(roomId).emit("user_stopped_typing", { username })
      }
    }
    if (users.size === 0) {
      typingUsers.delete(roomId)
    }
  }
}, TYPING_TIMEOUT)

let io

export function registerTypingHandlers(_io, socket, userSockets) {
  io = _io

  socket.on("typing", ({ roomId, username }) => {
    socket.data.typingUsername = username

    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Map())
    }
    typingUsers.get(roomId).set(username, Date.now())

    io.to(roomId).emit("user_typing", { username })
  })

  socket.on("stop_typing", ({ roomId, username }) => {
    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).delete(username)
      if (typingUsers.get(roomId).size === 0) {
        typingUsers.delete(roomId)
      }
    }

    io.to(roomId).emit("user_stopped_typing", { username })
  })

  socket.on("disconnect", () => {
    const username = socket.data.typingUsername
    if (username) {
      typingUsers.forEach((users, roomId) => {
        if (users.has(username)) {
          users.delete(username)
          if (users.size === 0) {
            typingUsers.delete(roomId)
          }
          io.to(roomId).emit("user_stopped_typing", { username })
        }
      })
    }
  })
}
