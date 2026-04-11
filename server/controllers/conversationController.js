const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// ─── GET ALL CONVERSATIONS ────────────────────────────
// Sidebar ke liye — logged in user ki saari conversations
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate('participants', 'username avatar')  // naam + avatar chahiye
            .populate({
                path: 'lastMessage',
                select: 'text senderId createdAt',
            })
            .sort({ updatedAt: -1 }); // Latest conversation pehle

        // Frontend ke liye format karo
        const formatted = conversations.map((conv) => {
            // "Other" participant nikalo — apne aap ko hata do
            const otherParticipant = conv.participants.find(
                (p) => p._id.toString() !== req.user._id.toString()
            );

            const unread = conv.unreadCount?.get(req.user._id.toString()) || 0;

            return {
                id: conv._id,
                contact: otherParticipant,
                lastMessage: conv.lastMessage,
                unreadCount: unread,
                updatedAt: conv.updatedAt,
            };
        });

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET OR CREATE CONVERSATION ──────────────────────
// Jab kisi contact pe click karo — existing conversation lo ya naya banao
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { userId } = req.params; // Jis se baat karni hai

        // Dono valid users hain?
        const otherUser = await User.findById(userId);
        if (!otherUser)
            return res.status(404).json({ message: 'User nahi mila' });

        // Pehle se conversation hai?
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, userId] },
        })
            .populate('participants', 'username avatar')
            .populate('lastMessage');

        // Nahi hai toh banao
        if (!conversation) {
            conversation = await Conversation.create({
                participants: [req.user._id, userId],
                unreadCount: {
                    [req.user._id.toString()]: 0,
                    [userId]: 0,
                },
            });

            // Populate karo response ke liye
            conversation = await conversation.populate('participants', 'username avatar');
        }

        res.status(200).json(conversation);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};