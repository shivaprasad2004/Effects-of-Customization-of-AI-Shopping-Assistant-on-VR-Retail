const logger = require('../utils/logger');

/**
 * Global Express error handler middleware.
 * Handles Mongoose validation errors, JWT errors, and generic errors.
 */
function errorHandler(err, req, res, next) {
    logger.error(`${req.method} ${req.path} → ${err.message}`, { stack: err.stack });

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, message: 'Validation error', errors });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(409).json({ success: false, message: `${field} already exists` });
    }

    // Celebrate/Joi validation error
    if (err.isJoi) {
        return res.status(400).json({ success: false, message: err.message });
    }

    // Default error
    const status = err.statusCode || err.status || 500;
    return res.status(status).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
}

module.exports = errorHandler;
