const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Online users track karne ke liye — { userId: socketId }
const onlineUsers = new Map();

const socketHandler = (io) => {

    // ─── MIDDLEWARE — Socket connection pe token verify karo ───
    io.use(async (socket, next) => {
        try {
            // Cookie se token lo
            const cookies = cookie.parse(socket.handshake.headers.cookie || '');
            const token = cookies.access_token;

            if (!token) return next(new Error('Authentication error — token nahi hai'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) return next(new Error('User nahi mila'));

            socket.user = user; // Socket pe user attach karo
            next();
        } catch (err) {
            next(new Error('Token invalid'));
        }
    });

    // ─── CONNECTION ───────────────────────────────────────────
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        console.log(`✅ Connected: ${socket.user.username} (${socket.id})`);

        // Online map mein daalo
        onlineUsers.set(userId, socket.id);

        // Sab ko batao ye user online aa gaya
        socket.broadcast.emit('userOnline', { userId });

        // Is user ko batao kaun kaun online hai abhi
        socket.emit('onlineUsers', Array.from(onlineUsers.keys()));

        // ─── JOIN CONVERSATION ────────────────────────────────
        // Jab user kisi chat pe click karta hai
        socket.on('joinConversation', async (conversationId) => {
            try {
                // Verify karo ye user is conversation mein hai
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id,
                });

                if (!conversation) return;

                // Socket room mein join karo
                socket.join(conversationId);

                // Unread count 0 karo
                await Conversation.findByIdAndUpdate(conversationId, {
                    $set: { [`unreadCount.${userId}`]: 0 },
                });

                // Messages seen mark karo
                await Message.updateMany(
                    { conversationId, seenBy: { $ne: socket.user._id } },
                    { $addToSet: { seenBy: socket.user._id } }
                );

                // Dusre participant ko batao messages dekh liye
                socket.to(conversationId).emit('messagesSeen', {
                    conversationId,
                    seenBy: userId,
                });

            } catch (err) {
                console.error('joinConversation error:', err.message);
            }
        });

        // ─── LEAVE CONVERSATION ───────────────────────────────
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(conversationId);
        });

        // ─── SEND MESSAGE ─────────────────────────────────────
        socket.on('sendMessage', async ({ conversationId, text }) => {
            try {
                // Validate
                if (!text?.trim()) return;

                // User is conversation mein hai?
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: socket.user._id,
                });

                if (!conversation) return;

                // DB mein save karo
                const message = await Message.create({
                    conversationId,
                    senderId: socket.user._id,
                    text: text.trim(),
                    seenBy: [socket.user._id],
                });

                // Sender info populate karo
                await message.populate('senderId', 'username avatar');

                // Dusre participants ka unread count badhao
                const otherParticipants = conversation.participants.filter(
                    (p) => p.toString() !== userId
                );

                const unreadUpdates = {};
                for (const participantId of otherParticipants) {
                    const pid = participantId.toString();
                    // Agar wo is conversation ke room mein hai (chat open hai)
                    // toh unread mat badhao — warna badhao
                    const isInRoom = io.sockets.adapter.rooms
                        .get(conversationId)
                        ?.has(onlineUsers.get(pid));

                    if (!isInRoom) {
                        const current = conversation.unreadCount?.get(pid) || 0;
                        unreadUpdates[`unreadCount.${pid}`] = current + 1;
                    }
                }

                // Conversation update karo
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: message._id,
                    ...unreadUpdates,
                });

                // Is conversation ke room mein message bhejo
                io.to(conversationId).emit('receiveMessage', {
                    conversationId,
                    message: {
                        _id: message._id,
                        text: message.text,
                        senderId: {
                            _id: socket.user._id,
                            username: socket.user.username,
                            avatar: socket.user.avatar,
                        },
                        seenBy: message.seenBy,
                        createdAt: message.createdAt,
                    },
                });

                // Offline participants ko bhi notify karo (sidebar update ke liye)
                for (const participantId of otherParticipants) {
                    const pid = participantId.toString();
                    const participantSocketId = onlineUsers.get(pid);
                    if (participantSocketId) {
                        io.to(participantSocketId).emit('newMessageNotification', {
                            conversationId,
                            message: {
                                text: message.text,
                                senderId: socket.user._id,
                                senderName: socket.user.username,
                            },
                        });
                    }
                }

            } catch (err) {
                console.error('sendMessage error:', err.message);
                socket.emit('error', { message: 'Message send nahi hua' });
            }
        });

        // ─── TYPING INDICATOR ─────────────────────────────────
        socket.on('typing', ({ conversationId }) => {
            socket.to(conversationId).emit('userTyping', {
                conversationId,
                userId,
                username: socket.user.username,
            });
        });

        socket.on('stopTyping', ({ conversationId }) => {
            socket.to(conversationId).emit('userStoppedTyping', {
                conversationId,
                userId,
            });
        });

        // ─── DISCONNECT ───────────────────────────────────────
        socket.on('disconnect', () => {
            console.log(`❌ Disconnected: ${socket.user.username}`);
            onlineUsers.delete(userId);

            // Sab ko batao ye offline ho gaya
            socket.broadcast.emit('userOffline', { userId });
        });
    });
};

module.exports = socketHandler;