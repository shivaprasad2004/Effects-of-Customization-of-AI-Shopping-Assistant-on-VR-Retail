const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { sendMessage, getHistory, clearHistory } = require('../controllers/chatbotController');

router.post('/message', authenticate, sendMessage);
router.get('/history/:sessionId', authenticate, getHistory);
router.delete('/history/:sessionId', authenticate, clearHistory);

module.exports = router;
