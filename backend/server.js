import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import { Server } from 'socket.io';

const app = express();

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId; // Get user ID from the socket handshake query

  console.log(`User connected: ${userId}`);
  if (userId) {
    userSocketMap[userId] = socket.id; // Store the socket ID for the user
  }

  function broadcastOnlineUsers() {
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  broadcastOnlineUsers(); // Emit the list of online users when a new user connects

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    if (userId) {
      delete userSocketMap[userId]; // Remove the socket ID when the user disconnects
    }
    broadcastOnlineUsers(); // Emit the updated list of online users
  });
});

app.use(express.json({ limit: '4mb' }));
app.use(cors());

app.use('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/messages', messageRouter);

await connectDB();

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
