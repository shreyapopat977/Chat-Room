const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Token generate karne ka helper
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
};

// ─── SIGNUP ───────────────────────────────────────────
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password)
            return res.status(400).json({ message: 'Sab fields required hain' });

        // Already exists check
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
            return res.status(409).json({ message: 'Email ya username already use ho raha hai' });

        // Password hash
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Avatar — UI Avatars se auto generate (free, no setup)
        const avatar = `https://ui-avatars.com/api/?name=${username}&background=random`;

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            avatar,
        });

        res.status(201).json({
            message: 'Account ban gaya!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── LOGIN ────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email aur password dono chahiye' });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(401).json({ message: 'Email registered nahi hai' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: 'Password galat hai' });

        res.status(200).json({
            message: 'Login successful!',
            token: generateToken(user._id),
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// ─── GET LOGGED IN USER (protected) ──────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};