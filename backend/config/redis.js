const Redis = require('ioredis');
const logger = require('../utils/logger');

let client;

/**
 * Connect to Redis. Exposes a singleton client.
 */
async function connectRedis() {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });

    client.on('error', (err) => logger.error('Redis error:', err.message));
    client.on('connect', () => logger.info('✅ Redis connected'));

    await client.connect();
}

/**
 * Returns the shared Redis client.
 * @returns {Redis}
 */
function getRedis() {
    return client;
}

module.exports = connectRedis;
module.exports.getRedis = getRedis;
