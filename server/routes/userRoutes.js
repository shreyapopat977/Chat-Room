const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/search', protect, async (req, res) => {
    try {
        const { q } = req.query;

        const query = {
            _id: { $ne: req.user._id }, // apne aap ko exclude karo
        };

        if (q && q.trim()) {
            query.username = { $regex: q.trim(), $options: 'i' };
        }

        const users = await User.find(query)
            .select('_id username avatar')
            .limit(20);

        console.log(`Search "${q}" → ${users.length} results`); // debug log

        res.json(users);
    } catch (err) {
        console.error('User search error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;