const axios = require('axios');
const Product = require('../models/Product');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/**
 * POST /api/blockchain/verify/:productId
 * Verify a product's authenticity certificate on-chain.
 * Simulates Hyperledger Fabric verification by checking immutable hashes and IPFS links.
 */
async function verifyProduct(req, res, next) {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Logic simulation: Layer 5 Trust Verification
        const isLuxury = ['electronics', 'fashion'].includes(product.category) && product.price > 10000;
        
        // Mock a blockchain certificate if it doesn't exist for luxury items
        const certHash = product.blockchainCertificateHash || (isLuxury ? `0x${Math.random().toString(16).slice(2, 42)}` : null);
        const ipfsUrl = product.ipfsCertificateUrl || (isLuxury ? `ipfs://Qm${Math.random().toString(36).slice(2, 46)}` : null);

        return res.json({
            success: true,
            verified: !!certHash,
            certificateHash: certHash,
            ipfsCertificateUrl: ipfsUrl,
            manufacturer: product.brand || 'VR Retail Certified',
            productName: product.name,
            timestamp: new Date().toISOString(),
            blockchain: 'Hyperledger Fabric (Permissioned)',
            storage: 'IPFS (Decentralized)'
        });
    } catch (err) { next(err); }
}

/**
 * POST /api/blockchain/pay
 * Initiate a blockchain payment via Smart Contract.
 * Triggers Solidity-style logic for secure escrow.
 */
async function initiatePayment(req, res, next) {
    try {
        const { orderId, amount, productIds, walletAddress } = req.body;
        
        // Simulation of Layer 5 Payment Flow:
        // 1. Validate against Decentralized Identity (DID)
        // 2. Prepare Smart Contract metadata (Solidity)
        // 3. IPFS Hash generation for receipt
        
        const txHash = `0x${Math.random().toString(16).slice(2, 66)}`;
        const receiptIPFS = `ipfs://bafybeig${Math.random().toString(36).slice(2, 48)}`;

        logger.info(`Blockchain Transaction: ${txHash} for Order ${orderId}`);

        return res.json({
            success: true,
            orderId,
            amount: `₹${amount}`,
            txHash,
            receiptIPFS,
            smartContract: 'PurchaseAgreement.sol',
            network: 'Polygon (Layer 2)',
            status: 'Smart Contract Executed (Escrow)',
            message: 'Payment secured via blockchain escrow. Funds will be released upon VR delivery verification.'
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
