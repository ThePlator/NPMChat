import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/user.routes.js';
import messageRouter from './routes/message.routes.js';
import fileRouter from './routes/file.routes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const { CLIENT_URL, NODE_ENV } = process.env;
const allowedOrigins = [
  CLIENT_URL,
  NODE_ENV !== 'production' ? 'http://localhost:3000' : null,
].filter(Boolean);

if (!CLIENT_URL && NODE_ENV === 'production') {
  console.error(
    'ERROR: CLIENT_URL is not set. Set it to your frontend URL (e.g. https://your-frontend.example).'
  );
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

export const userSocketMap = {};

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  console.log(`User connected: ${userId}`);
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  function broadcastOnlineUsers() {
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  }

  broadcastOnlineUsers();

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${userId}`);
    if (userId) {
      delete userSocketMap[userId];
    }
    broadcastOnlineUsers();
  });
});

app.use(express.json({ limit: '4mb' }));

app.use('/api/status', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
app.use('/api/v1/auth', userRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/files', fileRouter);
app.use('/', (req, res) => {
  res.send('NPMChat API is running');
});

await connectDB();

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
