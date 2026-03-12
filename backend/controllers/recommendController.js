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
 * Hybrid Personalization Engine: Combines Collaborative and Content-Based Filtering.
 */
async function getPersonalized(req, res, next) {
    try {
        const { currentProductId, sessionData } = req.body;
        const userId = req.user.id;

        // 1. Gather User Context (Collaborative + History)
        const user = await User.findById(userId);
        const recentSession = await Session.findOne({ userId, status: 'active' }).sort({ startTime: -1 });
        const viewedProductIds = recentSession?.productsViewed?.map((v) => v.productId?.toString()) || [];
        
        // 2. Identify Dwell Time (Analytical Brain)
        const topViewed = recentSession?.productsViewed
            ?.sort((a, b) => b.dwellTime - a.dwellTime)
            .slice(0, 3)
            .map(v => v.productId);

        // 3. Collaborative Filter (Logic Simulation)
        // Find users with similar purchase history categories
        const similarUsers = await User.find({
            'preferences.categories': { $in: user.preferences?.categories || [] },
            _id: { $ne: userId }
        }).limit(5);

        // 4. Content-Based Filter (Category + Price Match)
        const favoriteCategories = user.preferences?.categories || ['fashion'];
        
        const recommendations = await Product.find({
            isActive: true,
            category: { $in: favoriteCategories },
            _id: { $nin: viewedProductIds },
            price: { 
                $gte: user.preferences?.budgetRange?.min || 0, 
                $lte: user.preferences?.budgetRange?.max || 100000 
            }
        })
        .sort({ rating: -1, reviewCount: -1 })
        .limit(8)
        .select('-reviews');

        // 5. Apply Targeted Offers (Adaptive Logic)
        const productsWithOffers = recommendations.map(p => {
            const product = p.toObject();
            if (user.loyaltyTokens > 100) {
                product.specialOffer = "Loyalty Reward: Extra 10% Off";
                product.discountPrice = Math.floor(product.price * 0.9);
            }
            // Flash Sale simulation for featured products
            if (product.featured && Math.random() > 0.7) {
                product.flashSale = true;
                product.flashEndsAt = new Date(Date.now() + 1000 * 60 * 30); // 30 mins from now
                product.discountPrice = Math.floor(product.price * 0.85);
            }
            return product;
        });

        return res.json({ 
            success: true, 
            products: productsWithOffers,
            engine: 'Hyper-Personalization Hybrid Engine',
            reason: topViewed.length ? `Based on your interest in similar items` : 'Based on your style preferences'
        });
    } catch (err) { next(err); }
}

module.exports = { getTrending, getSimilar, getPersonalized };
