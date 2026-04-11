const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const COOKIE_OPTIONS = {
    httpOnly: true,                                    // JS access nahi kar sakta
    secure: process.env.NODE_ENV === 'production',    // HTTPS only in prod
    sameSite: 'strict',
};

const generateTokens = (userId) => {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: userId },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

const setTokenCookies = (res, accessToken, refreshToken) => {
    res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 15 * 60 * 1000,          // 15 minutes
    });
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// ─── SIGNUP ───────────────────────────────────────────
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password)
            return res.status(400).json({ message: 'Sab fields required hain' });

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser)
            return res.status(409).json({ message: 'Email ya username already use ho raha hai' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const avatar = `https://ui-avatars.com/api/?name=${username}&background=random`;

        const user = await User.create({ username, email, password: hashedPassword, avatar });

        const { accessToken, refreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, refreshToken);

        res.status(201).json({
            message: 'Account ban gaya!',
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

        const { accessToken, refreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, refreshToken);

        res.status(200).json({
            message: 'Login successful!',
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

// ─── REFRESH TOKEN ────────────────────────────────────
exports.refresh = async (req, res) => {
    try {
        const token = req.cookies.refresh_token;

        if (!token)
            return res.status(401).json({ message: 'Refresh token nahi mila' });

        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user)
            return res.status(401).json({ message: 'User nahi mila' });

        const { accessToken, refreshToken } = generateTokens(user._id);
        setTokenCookies(res, accessToken, refreshToken); // Refresh token rotation

        res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
            },
        });
    } catch (err) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        res.status(401).json({ message: 'Refresh token invalid ya expire ho gaya' });
    }
};

// ─── LOGOUT ───────────────────────────────────────────
exports.logout = (req, res) => {
    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
    res.status(200).json({ message: 'Logout successful' });
};

// ─── GET ME ───────────────────────────────────────────
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};