const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Generate a signed access token (short-lived).
 * @param {Object} payload - { id, role }
 * @returns {string}
 */
function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '15m',
    });
}

/**
 * Generate a signed refresh token (long-lived).
 * @param {Object} payload - { id }
 * @returns {string}
 */
function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
    });
}

/**
 * Middleware: verify access token in Authorization header.
 * Attaches decoded payload to req.user.
 */
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token expired' });
        }
        logger.warn('Invalid token attempt:', err.message);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

/**
 * Middleware: optional authentication (doesn't fail if no token).
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return next();

    const token = authHeader.split(' ')[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_) {
        // Silently fail for optional auth
    }
    next();
}

module.exports = { authenticate, optionalAuth, generateAccessToken, generateRefreshToken };
