const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB using the URI in environment variables.
 * Retries up to 5 times on failure.
 */
async function connectMongo() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-retail';
    let retries = 5;

    while (retries) {
        try {
            await mongoose.connect(uri);
            logger.info('✅ MongoDB connected');
            return;
        } catch (err) {
            retries -= 1;
            logger.warn(`MongoDB connection failed. Retries left: ${retries}`);
            if (!retries) throw err;
            await new Promise((r) => setTimeout(r, 3000));
        }
    }
}

module.exports = connectMongo;
