"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const SocketHandler_1 = require("./socket/SocketHandler");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
const socketHandler = new SocketHandler_1.SocketHandler(io);
io.on('connection', (socket) => {
    socketHandler.handleConnection(socket);
});
// Start cleanup interval
socketHandler.startCleanupInterval();
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Chain Reaction server running on port ${PORT}`);
});
