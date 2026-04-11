const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getConversations,
    getOrCreateConversation,
} = require('../controllers/conversationController');

// Sab protected hain — login zaroori
router.use(protect);

// GET  /api/conversations         → sidebar ke liye saari conversations
// GET  /api/conversations/:userId → us user se conversation lo/banao
router.get('/', getConversations);
router.get('/:userId', getOrCreateConversation);

module.exports = router;