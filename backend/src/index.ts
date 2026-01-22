import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { SocketHandler } from './socket/SocketHandler';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get room list
app.get('/api/rooms', (req, res) => {
  // This would be implemented if we want to show public rooms
  res.json({ rooms: [] });
});

// Socket.IO handling
const socketHandler = new SocketHandler(io);

io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

// Start cleanup interval
socketHandler.startCleanupInterval();

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Chain Reaction server running on port ${PORT}`);
});