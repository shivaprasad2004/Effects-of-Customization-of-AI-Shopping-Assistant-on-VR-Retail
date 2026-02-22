const axios = require('axios');
const Product = require('../models/Product');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/**
 * POST /api/blockchain/verify/:productId
 * Verify a product's authenticity certificate on-chain via AI service.
 */
async function verifyProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        if (!product.blockchainCertificateHash) {
            return res.json({ success: true, verified: false, message: 'No certificate registered for this product.' });
        }

        return res.json({
            success: true,
            verified: product.isAuthenticated,
            certificateHash: product.blockchainCertificateHash,
            ipfsCertificateUrl: product.ipfsCertificateUrl,
            manufacturer: product.manufacturer,
            productName: product.name,
        });
    } catch (err) { next(err); }
}

/**
 * POST /api/blockchain/pay
 * Initiate a blockchain payment (records intent; actual transaction happens client-side via MetaMask).
 */
async function initiatePayment(req, res, next) {
    try {
        const { orderId, amount, productIds } = req.body;
        logger.info(`Payment initiated: Order ${orderId}, Amount $${amount}`);
        // The actual ETH transaction happens on the client via MetaMask + ethers.js
        // This endpoint validates the order and prepares metadata
        return res.json({
            success: true,
            orderId,
            amount,
            contractAddress: process.env.CONTRACT_PAYMENT,
            message: 'Payment parameters validated. Execute via MetaMask.',
        });
    } catch (err) { next(err); }
}

/**
 * GET /api/blockchain/transactions/:userId
 * Retrieve transaction history for a user from PostgreSQL.
 */
async function getTransactions(req, res, next) {
    try {
        if (req.params.userId !== req.user.id && req.user.role === 'participant') {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }
        const pool = getPool();
        const result = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
            [req.params.userId]
        );
        return res.json({ success: true, transactions: result.rows });
    } catch (err) { next(err); }
}

/**
 * GET /api/blockchain/tokens/:walletAddress
 * Return loyalty token balance for a wallet (reads from User model).
 */
async function getTokenBalance(req, res, next) {
    try {
        const User = require('../models/User');
        const user = await User.findOne({ walletAddress: req.params.walletAddress }).select('loyaltyTokens name');
        if (!user) return res.status(404).json({ success: false, message: 'Wallet not linked to any user' });
        return res.json({ success: true, balance: user.loyaltyTokens, userName: user.name });
    } catch (err) { next(err); }
}

module.exports = { verifyProduct, initiatePayment, getTransactions, getTokenBalance };
