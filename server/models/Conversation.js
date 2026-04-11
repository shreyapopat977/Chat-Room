const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
    {
        // Jinke beech baat ho rahi hai
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
        ],

        // Sidebar mein last message dikhane ke liye
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message',
            default: null,
        },

        // Har participant ka unread count
        unreadCount: {
            type: Map,
            of: Number,
            default: {},
        },
    },
    { timestamps: true }
);

// Index — ek user ki saari conversations jaldi milein
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);