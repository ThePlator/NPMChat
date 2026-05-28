const typingUsers = new Map() // roomId -> Set of usernames

export function registerTypingHandlers(io, socket, userSockets) {
  socket.on("typing", ({ roomId, username }) => {
    socket.data.typingUsername = username

    io.to(roomId).emit("user_typing", { username })

    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).add(username)
    } else {
      typingUsers.set(roomId, new Set([username]))
    }
  })

  socket.on("stop_typing", ({ roomId, username }) => {
    io.to(roomId).emit("user_stopped_typing", { username })

    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).delete(username)
    }
  })

  socket.on("disconnect", () => {
    const username = socket.data.typingUsername
    if (username) {
      typingUsers.forEach((users, roomId) => {
        if (users.has(username)) {
          users.delete(username)
          io.to(roomId).emit("user_stopped_typing", { username })
        }
      })
    }
  })
}
