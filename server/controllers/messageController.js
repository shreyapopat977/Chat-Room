const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// ─── GET MESSAGES ─────────────────────────────────────
// Kisi conversation ke saare messages lo (pagination ke saath)
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 30;
        const skip = (page - 1) * limit;

        // Ye conversation is user ki hai?
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id,
        });

        if (!conversation)
            return res.status(403).json({ message: 'Is conversation ka access nahi hai' });

        // Messages lo — purane pehle (createdAt asc)
        const messages = await Message.find({ conversationId })
            .populate('senderId', 'username avatar')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Message.countDocuments({ conversationId });

        // Messages padhne ke baad unread count 0 karo
        await Conversation.findByIdAndUpdate(conversationId, {
            $set: { [`unreadCount.${req.user._id}`]: 0 },
        });

        res.status(200).json({
            messages,
            pagination: {
                page,
                limit,
                total,
                hasMore: skip + messages.length < total,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── SEND MESSAGE (REST fallback) ────────────────────
// Socket nahi chala toh ye use hoga
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;

        if (!text?.trim())
            return res.status(400).json({ message: 'Message empty nahi ho sakta' });

        // Conversation valid hai aur user participant hai?
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: req.user._id,
        });

        if (!conversation)
            return res.status(403).json({ message: 'Access nahi hai' });

        // Message save karo
        const message = await Message.create({
            conversationId,
            senderId: req.user._id,
            text: text.trim(),
            seenBy: [req.user._id], // Sender ne toh dekha hi hai
        });

        // Populate sender info
        await message.populate('senderId', 'username avatar');

        // Dusre participant ka unread count badhao
        const otherParticipants = conversation.participants.filter(
            (p) => p.toString() !== req.user._id.toString()
        );

        const unreadUpdates = {};
        for (const participantId of otherParticipants) {
            const currentCount = conversation.unreadCount?.get(participantId.toString()) || 0;
            unreadUpdates[`unreadCount.${participantId}`] = currentCount + 1;
        }

        // Conversation update karo — lastMessage + unread
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message._id,
            ...unreadUpdates,
        });

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── MARK AS SEEN ─────────────────────────────────────
exports.markAsSeen = async (req, res) => {
    try {
        const { conversationId } = req.params;

        // Saare messages mein apna id add karo seenBy mein
        await Message.updateMany(
            {
                conversationId,
                seenBy: { $ne: req.user._id },
            },
            { $addToSet: { seenBy: req.user._id } }
        );

        // Unread count 0 karo
        await Conversation.findByIdAndUpdate(conversationId, {
            $set: { [`unreadCount.${req.user._id}`]: 0 },
        });

        res.status(200).json({ message: 'Messages marked as seen' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};