const rateLimit = require('express-rate-limit');

/**
 * API rate limiter: 100 requests per 15 minutes per IP.
 */
const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});

module.exports = rateLimiter;
