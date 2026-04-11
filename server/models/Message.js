const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
        },

        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        text: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        // Baad mein image/file support ke liye
        mediaUrl: {
            type: String,
            default: null,
        },

        // Kisne padha — seen receipts ke liye
        seenBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

// Index — ek conversation ke messages jaldi milein
messageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);