const typingUsers = new Map() // roomId -> Set of usernames

export function registerTypingHandlers(io, socket, userSocketMap) {
  socket.on("typing", ({ roomId, username }) => {
    // Save the username on the socket object for disconnect cleanup
    socket.data.typingUsername = username

    const receiverSocketId = userSocketMap[roomId]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_typing", { username })
    }

    // Track typing user for cleanup
    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).add(username)
    } else {
      typingUsers.set(roomId, new Set([username]))
    }
  })

  socket.on("stop_typing", ({ roomId, username }) => {
    const receiverSocketId = userSocketMap[roomId]
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user_stopped_typing", { username })
    }

    if (typingUsers.has(roomId)) {
      typingUsers.get(roomId).delete(username)
    }
  })

  // Clean up on disconnect
  socket.on("disconnect", () => {
    const username = socket.data.typingUsername
    if (username) {
      typingUsers.forEach((users, roomId) => {
        if (users.has(username)) {
          users.delete(username)
          const receiverSocketId = userSocketMap[roomId]
          if (receiverSocketId) {
            io.to(receiverSocketId).emit("user_stopped_typing", {
              username,
            })
          }
        }
      })
    }
  })
}
