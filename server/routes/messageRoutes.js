const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getMessages,
    sendMessage,
    markAsSeen,
} = require('../controllers/messageController');

router.use(protect);

// GET  /api/messages/:conversationId          → messages lo
// POST /api/messages/:conversationId          → message bhejo
// PUT  /api/messages/:conversationId/seen     → seen mark karo
router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.put('/:conversationId/seen', markAsSeen);

module.exports = router;