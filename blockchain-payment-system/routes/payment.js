const express = require('express');
const router = express.Router();
const paymentService = require('../service/PaymentService');

router.post('/pay', async (req, res) => {
    try {
        const { orderId, amount, buyerAddress } = req.body;
        if (!orderId || !amount) return res.status(400).json({ success: false, message: 'orderId and amount required' });
        const result = await paymentService.processPayment(orderId, parseFloat(amount), buyerAddress || '0xDefaultBuyer');
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/balance/:address', async (req, res) => {
    try {
        const result = await paymentService.getLoyaltyBalance(req.params.address);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/verify-product', async (req, res) => {
    try {
        const { sku } = req.body;
        if (!sku) return res.status(400).json({ success: false, message: 'sku required' });
        const result = await paymentService.verifyProduct(sku);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/register-product', async (req, res) => {
    try {
        const { sku, name, certificateHash } = req.body;
        if (!sku || !name) return res.status(400).json({ success: false, message: 'sku and name required' });
        const result = await paymentService.registerProduct(sku, name, certificateHash);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/transactions', (req, res) => {
    res.json({ success: true, transactions: paymentService.getTransactionHistory() });
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'blockchain-payment', mockMode: paymentService.mockMode });
});

module.exports = router;
