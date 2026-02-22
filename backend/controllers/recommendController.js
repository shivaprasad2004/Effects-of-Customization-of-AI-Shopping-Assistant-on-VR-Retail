const axios = require('axios');
const Product = require('../models/Product');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * GET /api/recommend/trending
 * Return top trending products based on view count and rating.
 */
async function getTrending(req, res, next) {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ reviewCount: -1, rating: -1 })
            .limit(10)
            .select('-reviews');
        return res.json({ success: true, products });
    } catch (err) { next(err); }
}

/**
 * GET /api/recommend/similar/:productId
 * Return products in the same category (basic content-based similarity).
 */
async function getSimilar(req, res, next) {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const similar = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true,
            price: { $gte: product.price * 0.5, $lte: product.price * 1.5 },
        }).sort({ rating: -1 }).limit(6).select('-reviews');

        return res.json({ success: true, products: similar });
    } catch (err) { next(err); }
}

/**
 * POST /api/recommend
 * Get personalized recommendations via Python AI service.
 * Falls back to popularity-based if AI service is unavailable.
 */
async function getPersonalized(req, res, next) {
    try {
        const { currentProductId, sessionData } = req.body;
        const userId = req.user.id;

        // Get session history for context
        const recentSession = await Session.findOne({ userId, status: 'active' }).sort({ startTime: -1 });
        const viewedProductIds = recentSession?.productsViewed?.map((v) => v.productId?.toString()) || [];

        let recommendations;
        try {
            // Attempt to call Python AI service
            const base = process.env.AI_SERVICE_URL || 'http://localhost:8000';
            const aiResponse = await axios.post(
                `${base}/api/v1/recommend/personalized`,
                {
                    user_id: userId,
                    history: viewedProductIds,
                    catalog: []
                },
                { timeout: 5000 }
            );
            // Normalize AI response
            recommendations = {
                recommended_products: aiResponse.data?.recommendations || [],
                reason: 'AI personalized',
                source: 'ai-service'
            };
        } catch (aiErr) {
            logger.warn('AI service unavailable, using fallback recommendations');
            // Fallback: return top-rated products not yet viewed
            const products = await Product.find({
                isActive: true,
                _id: { $nin: viewedProductIds },
            }).sort({ rating: -1 }).limit(6).select('-reviews');
            recommendations = { recommended_products: products, reason: 'Top-rated products based on popularity', source: 'fallback' };
        }

        return res.json({ success: true, ...recommendations });
    } catch (err) { next(err); }
}

module.exports = { getTrending, getSimilar, getPersonalized };
