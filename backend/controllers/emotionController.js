const EmotionLog = require('../models/EmotionLog');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * POST /api/emotion/log
 * Log a real-time emotion event from the frontend.
 * Also emits a WebSocket event to trigger adaptive responses.
 */
async function logEmotion(req, res, next) {
    try {
        const { sessionId, emotion, confidence, dominantEmotions, zone, productId } = req.body;
        if (!sessionId || !emotion) {
            return res.status(400).json({ success: false, message: 'sessionId and emotion required' });
        }

        const log = new EmotionLog({
            userId: req.user.id,
            sessionId,
            emotion,
            confidence: confidence || 1,
            dominantEmotions: dominantEmotions || [],
            zone: zone || null,
            productId: productId || null,
        });
        await log.save();

        // Also push to session's emotion log
        await Session.findByIdAndUpdate(sessionId, {
            $push: { emotionLog: { emotion, confidence: confidence || 1, zone, timestamp: new Date() } },
        });

        // Emit emotion update to admin via Socket.io
        const io = req.app.get('io');
        if (io) {
            io.to(`session:${sessionId}`).emit('emotion:update', { emotion, confidence, zone, timestamp: new Date() });
            io.to('admin').emit('emotion:update', { userId: req.user.id, emotion, sessionId, timestamp: new Date() });
        }

        // Adaptive AI logic: Modify user state based on emotion
        const User = require('../models/User');
        if (emotion === 'happy' || emotion === 'surprised') {
            // Reward positive engagement
            await User.findByIdAndUpdate(req.user.id, { $inc: { loyaltyTokens: 5 } });
        }

        // Check frustration count — offer discount if frustrated 3+ times in last 10 events
        const recentEmotions = await EmotionLog.find({ sessionId }).sort({ timestamp: -1 }).limit(10);
        const frustrationCount = recentEmotions.filter((e) => e.emotion === 'angry' || e.emotion === 'disgusted').length;
        let triggerDiscount = false;
        if (frustrationCount >= 3) {
            triggerDiscount = true;
            if (io) io.to(`session:${sessionId}`).emit('notification:discount', { message: 'Special 15% off — just for you!' });
        }

        return res.json({ success: true, triggerDiscount });
    } catch (err) { next(err); }
}

/**
 * GET /api/emotion/session/:sessionId
 * Get the full emotion timeline for a session.
 */
async function getSessionEmotions(req, res, next) {
    try {
        const logs = await EmotionLog.find({ sessionId: req.params.sessionId }).sort({ timestamp: 1 });
        return res.json({ success: true, logs });
    } catch (err) { next(err); }
}

module.exports = { logEmotion, getSessionEmotions };
