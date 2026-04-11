const express = require('express');
const http = require('http');           // Socket.IO ke liye http server chahiye
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

dotenv.config();
connectDB();

const app = express();

// ─── HTTP server banao (Express ke upar) ─────────────
const server = http.createServer(app);

// ─── Socket.IO setup ──────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,  // Cookies allow karne ke liye
    },
});

// ─── Middleware ───────────────────────────────────────
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── REST Routes ──────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.get('/', (req, res) => res.send('Chat-Room API running'));

// ─── Socket Events ────────────────────────────────────
socketHandler(io);

// ─── Server Start ─────────────────────────────────────
// app.listen nahi — server.listen use karo (Socket.IO ke liye)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));