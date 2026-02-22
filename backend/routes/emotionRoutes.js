const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { logEmotion, getSessionEmotions } = require('../controllers/emotionController');

router.post('/log', authenticate, logEmotion);
router.get('/session/:sessionId', authenticate, getSessionEmotions);

module.exports = router;
