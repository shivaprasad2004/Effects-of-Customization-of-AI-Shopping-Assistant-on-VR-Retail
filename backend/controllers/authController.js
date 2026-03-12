const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../middleware/authMiddleware');
const { getRedis } = require('../config/redis');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * POST /api/auth/register
 * Register a new user. Auto-assigns experiment group (A/B round-robin).
 */
async function register(req, res, next) {
    try {
        const { name, email, password, age, gender } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'Email already registered' });
        }

        // Assign experiment group based on total user count (round-robin A/B)
        const totalUsers = await User.countDocuments();
        const groupType = totalUsers % 2 === 0 ? 'A' : 'B';

        const user = new User({
            name,
            email,
            passwordHash: password, // Pre-save hook will hash it
            age: age ? parseInt(age, 10) : undefined,
            gender,
            groupType,
        });
        await user.save();

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });
        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`New user registered: ${email} (Group ${groupType})`);

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            accessToken,
            refreshToken,
            user: user.toPublic(),
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/login
 * Login with email + password. Returns access and refresh tokens.
 */
const ALLOWED_EMAILS = [
    '22eg105h13@anurag.edu.in',
    '22eg105h30@anurag.edu.in',
    '22eg105h37@anurag.edu.in',
    '22eg105h40@anurag.edu.in'
];

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Restriction logic: Only allow specific emails
        if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
            return res.status(403).json({ success: false, message: 'Access denied. Only authorized users can log in.' });
        }

        const user = await User.findOne({ email }).select('+passwordHash +refreshToken');
        if (!user || !user.passwordHash) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken({ id: user._id, role: user.role });
        const refreshToken = generateRefreshToken({ id: user._id });
        user.refreshToken = refreshToken;
        await user.save();

        logger.info(`User logged in: ${email}`);

        return res.json({
            success: true,
            accessToken,
            refreshToken,
            user: user.toPublic(),
        });
    } catch (err) {
        next(err);
    }
}

/**
 * POST /api/auth/refresh
 * Exchange a valid refresh token for a new access token.
 */
async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }

        // Check if token is blacklisted
        const redis = getRedis();
        const blacklisted = await redis.get(`bl:${refreshToken}`);
        if (blacklisted) {
            return res.status(401).json({ success: false, message: 'Token revoked' });
        }

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ success: false, message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken({ id: user._id, role: user.role });
        const newRefreshToken = generateRefreshToken({ id: user._id });
        user.refreshToken = newRefreshToken;
        await user.save();

        return res.json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /api/auth/logout
 * Revoke the refresh token (blacklist it in Redis).
 */
async function logout(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            const redis = getRedis();
            // Blacklist the token for 7 days (matches refresh expiry)
            await redis.setex(`bl:${refreshToken}`, 7 * 24 * 60 * 60, '1');

            const user = await User.findById(req.user?.id);
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }
        return res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
}

module.exports = { register, login, refresh, logout };
