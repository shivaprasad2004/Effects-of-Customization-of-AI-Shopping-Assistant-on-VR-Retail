const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    verifyProduct, initiatePayment, getTransactions, getTokenBalance,
} = require('../controllers/blockchainController');

router.post('/verify/:productId', verifyProduct);
router.post('/pay', authenticate, initiatePayment);
router.get('/transactions/:userId', authenticate, getTransactions);
router.get('/tokens/:walletAddress', authenticate, getTokenBalance);

module.exports = router;
