const { Pool } = require('pg');
const logger = require('../utils/logger');

let pool;

/**
 * Connect to PostgreSQL and initialize the transactions table.
 */
async function connectPostgres() {
    pool = new Pool({ connectionString: process.env.POSTGRES_URI });

    try {
        await pool.query('SELECT 1');
        logger.info('✅ PostgreSQL connected');

        // Run schema migrations inline (idempotent)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id       VARCHAR(255) NOT NULL,
        session_id    VARCHAR(255),
        order_id      VARCHAR(255) UNIQUE NOT NULL,
        products      JSONB NOT NULL DEFAULT '[]',
        total_amount  NUMERIC(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'card',
        tx_hash       VARCHAR(255),
        status        VARCHAR(50) DEFAULT 'pending',
        loyalty_tokens_earned INTEGER DEFAULT 0,
        created_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_session_id ON transactions(session_id);
    `);
        logger.info('✅ PostgreSQL schema ready');
    } catch (err) {
        logger.error('PostgreSQL connection error:', err.message);
        throw err;
    }
}

/**
 * Returns the shared PostgreSQL connection pool.
 * @returns {Pool}
 */
function getPool() {
    return pool;
}

module.exports = connectPostgres;
module.exports.getPool = getPool;
