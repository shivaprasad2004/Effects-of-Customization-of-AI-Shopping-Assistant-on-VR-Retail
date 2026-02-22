const Session = require('../models/Session');
const EmotionLog = require('../models/EmotionLog');
const Product = require('../models/Product');
const { getPool } = require('../config/postgres');
const logger = require('../utils/logger');

/**
 * GET /api/analytics/experiment
 * Compare Group A vs Group B across all key research metrics.
 * Accessible by researcher and admin roles.
 */
async function getExperimentAnalytics(req, res, next) {
    try {
        const { startDate, endDate, gender, minAge, maxAge } = req.query;
        const dateFilter = {};
        if (startDate) dateFilter.$gte = new Date(startDate);
        if (endDate) dateFilter.$lte = new Date(endDate);

        const aggregatePipeline = [
            { $match: { status: 'completed', ...(Object.keys(dateFilter).length && { startTime: dateFilter }) } },
            {
                $group: {
                    _id: '$groupType',
                    count: { $sum: 1 },
                    avgConversionRate: { $avg: '$metrics.conversionRate' },
                    avgEngagementTime: { $avg: '$metrics.engagementTime' },
                    avgRecommendationAcceptance: { $avg: '$metrics.recommendationAcceptance' },
                    avgCsat: { $avg: '$surveyResponse.csat' },
                    avgTrust: { $avg: '$surveyResponse.trust' },
                    avgEaseOfUse: { $avg: '$surveyResponse.easeOfUse' },
                    totalPurchases: { $sum: { $size: '$purchases' } },
                    totalProductsViewed: { $sum: { $size: '$productsViewed' } },
                },
            },
        ];

        const results = await Session.aggregate(aggregatePipeline);

        // Reshape into { A: {...}, B: {...} }
        const metrics = {};
        results.forEach((r) => { metrics[r._id] = r; });

        // Emotion distribution per group
        const emotionAgg = await Session.aggregate([
            { $match: { status: 'completed' } },
            { $unwind: '$emotionLog' },
            { $group: { _id: { group: '$groupType', emotion: '$emotionLog.emotion' }, count: { $sum: 1 } } },
        ]);

        const emotionData = { A: {}, B: {} };
        emotionAgg.forEach(({ _id, count }) => {
            if (_id.group) emotionData[_id.group][_id.emotion] = (emotionData[_id.group][_id.emotion] || 0) + count;
        });

        // Zone heatmap
        const zoneAgg = await Session.aggregate([
            { $unwind: '$productsViewed' },
            { $group: { _id: { zone: '$productsViewed.zone', group: '$groupType' }, visits: { $sum: 1 }, avgDwell: { $avg: '$productsViewed.dwellTime' } } },
        ]);

        return res.json({
            success: true,
            metrics,
            emotionData,
            zoneHeatmap: zoneAgg,
            totalParticipants: (metrics.A?.count || 0) + (metrics.B?.count || 0),
        });
    } catch (err) { next(err); }
}

/**
 * GET /api/analytics/user/:userId
 * Get analytics for an individual participant.
 */
async function getUserAnalytics(req, res, next) {
    try {
        const sessions = await Session.find({ userId: req.params.userId, status: 'completed' })
            .select('-chatbotInteractions')
            .populate('productsViewed.productId', 'name category price');
        return res.json({ success: true, sessions });
    } catch (err) { next(err); }
}

/**
 * GET /api/analytics/export/csv
 * Export all session data as CSV (researcher/admin only).
 */
async function exportCSV(req, res, next) {
    try {
        const sessions = await Session.find({ status: 'completed' })
            .populate('userId', 'name email age gender groupType')
            .lean();

        const rows = [
            ['session_id', 'user_name', 'email', 'age', 'gender', 'group', 'start', 'duration', 'csat', 'trust', 'ease_of_use', 'conversion_rate', 'engagement_time', 'products_viewed', 'purchases', 'emotion_happy', 'emotion_neutral', 'emotion_angry'],
        ];

        sessions.forEach((s) => {
            const u = s.userId || {};
            const sd = s.surveyResponse || {};
            const m = s.metrics || {};
            const emo = m.emotionDistribution || {};
            rows.push([
                s._id, u.name, u.email, u.age, u.gender, s.groupType,
                s.startTime?.toISOString(), s.duration,
                sd.csat, sd.trust, sd.easeOfUse,
                m.conversionRate?.toFixed(2), m.engagementTime,
                s.productsViewed?.length, s.purchases?.length,
                emo.happy || 0, emo.neutral || 0, emo.angry || 0,
            ]);
        });

        const csv = rows.map((r) => r.map((v) => `"${v ?? ''}"`).join(',')).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="vr-retail-analytics.csv"');
        return res.send(csv);
    } catch (err) { next(err); }
}

/**
 * GET /api/analytics/export/pdf
 * Return a simple JSON summary for PDF report generation on the frontend.
 */
async function exportPDFData(req, res, next) {
    try {
        const totalSessions = await Session.countDocuments({ status: 'completed' });
        const groupA = await Session.countDocuments({ groupType: 'A', status: 'completed' });
        const groupB = await Session.countDocuments({ groupType: 'B', status: 'completed' });
        const avgCsat = await Session.aggregate([
            { $match: { status: 'completed', 'surveyResponse.csat': { $exists: true } } },
            { $group: { _id: '$groupType', avg: { $avg: '$surveyResponse.csat' } } },
        ]);
        return res.json({ success: true, report: { totalSessions, groupA, groupB, avgCsat } });
    } catch (err) { next(err); }
}

/**
 * GET /api/analytics/live
 * Return count of currently active sessions (for admin dashboard).
 */
async function getLiveStats(req, res, next) {
    try {
        const activeSessions = await Session.countDocuments({ status: 'active' });
        const recentEmotions = await EmotionLog.find({ timestamp: { $gte: new Date(Date.now() - 60000) } })
            .sort({ timestamp: -1 }).limit(20);
        return res.json({ success: true, activeSessions, recentEmotions });
    } catch (err) { next(err); }
}

module.exports = { getExperimentAnalytics, getUserAnalytics, exportCSV, exportPDFData, getLiveStats };
