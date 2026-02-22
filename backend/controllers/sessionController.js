const Session = require('../models/Session');
const User = require('../models/User');
const { getPool } = require('../config/postgres');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * POST /api/sessions/start
 * Start a new VR shopping session. Assigns group from user profile.
 */
async function startSession(req, res, next) {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const session = new Session({
            userId: user._id,
            groupType: user.groupType || 'A',
            startTime: new Date(),
        });
        await session.save();

        logger.info(`Session started: ${session._id} (User: ${user.email}, Group: ${user.groupType})`);
        return res.status(201).json({ success: true, session });
    } catch (err) { next(err); }
}

/**
 * PUT /api/sessions/:id/end
 * End a session and compute research metrics.
 */
async function endSession(req, res, next) {
    try {
        const session = await Session.findById(req.params.id);
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

        const endTime = new Date();
        const duration = Math.round((endTime - session.startTime) / 1000);

        // Compute metrics
        const productsViewed = session.productsViewed.length;
        const purchases = session.purchases.length;
        const conversionRate = productsViewed > 0 ? (purchases / productsViewed) * 100 : 0;

        const chatTotal = session.chatbotInteractions.length;
        const chatAccepted = session.chatbotInteractions.filter((c) => c.intent === 'buy').length;
        const recommendationAcceptance = chatTotal > 0 ? (chatAccepted / chatTotal) * 100 : 0;

        // Emotion distribution
        const emotionDist = {};
        session.emotionLog.forEach((e) => { emotionDist[e.emotion] = (emotionDist[e.emotion] || 0) + 1; });

        const zonesVisited = [...new Set(session.productsViewed.map((p) => p.zone).filter(Boolean))];

        session.endTime = endTime;
        session.duration = duration;
        session.status = 'completed';
        session.metrics = { conversionRate, engagementTime: duration, recommendationAcceptance, emotionDistribution: emotionDist, zonesVisited };
        await session.save();

        logger.info(`Session ended: ${session._id}, Duration: ${duration}s`);
        return res.json({ success: true, session });
    } catch (err) { next(err); }
}

/**
 * POST /api/sessions/:id/survey
 * Submit post-session survey.
 */
async function submitSurvey(req, res, next) {
    try {
        const { csat, trust, easeOfUse, recommendation, comments } = req.body;
        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { $set: { surveyResponse: { csat, trust, easeOfUse, recommendation, comments, submittedAt: new Date() } } },
            { new: true }
        );
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        return res.json({ success: true, message: 'Survey submitted', session });
    } catch (err) { next(err); }
}

/**
 * GET /api/sessions/:id/analytics
 * Get analytics summary for a specific session.
 */
async function getSessionAnalytics(req, res, next) {
    try {
        const session = await Session.findById(req.params.id)
            .populate('productsViewed.productId', 'name category price')
            .populate('purchases.productId', 'name price');
        if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
        return res.json({ success: true, session });
    } catch (err) { next(err); }
}

/**
 * POST /api/sessions/:id/product-view
 * Log a product view event within a session.
 */
async function logProductView(req, res, next) {
    try {
        const { productId, dwellTime, zone } = req.body;
        await Session.findByIdAndUpdate(req.params.id, {
            $push: { productsViewed: { productId, dwellTime: dwellTime || 0, zone, timestamp: new Date() } },
        });
        return res.json({ success: true });
    } catch (err) { next(err); }
}

/**
 * POST /api/sessions/:id/purchase
 * Record a purchase within a session and update loyalty tokens.
 */
async function recordPurchase(req, res, next) {
    try {
        const { productId, amount, txHash } = req.body;
        const orderId = uuidv4();
        const loyaltyEarned = Math.floor(amount);

        await Session.findByIdAndUpdate(req.params.id, {
            $push: { purchases: { productId, amount, txHash, timestamp: new Date() } },
        });

        // Update user loyalty tokens and purchase history
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { loyaltyTokens: loyaltyEarned },
            $push: { purchaseHistory: { productId, amount, txHash, date: new Date() } },
        });

        // Record in PostgreSQL
        const pool = getPool();
        await pool.query(
            `INSERT INTO transactions (id, user_id, session_id, order_id, products, total_amount, payment_method, tx_hash, status, loyalty_tokens_earned)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'completed', $9)`,
            [uuidv4(), req.user.id, req.params.id, orderId, JSON.stringify([{ productId, amount }]), amount, txHash ? 'blockchain' : 'card', txHash || null, loyaltyEarned]
        );

        return res.json({ success: true, orderId, loyaltyEarned });
    } catch (err) { next(err); }
}

module.exports = { startSession, endSession, submitSurvey, getSessionAnalytics, logProductView, recordPurchase };
