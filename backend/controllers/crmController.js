const Product = require('../models/Product');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * GET /api/crm/customer-profile/:userId
 * Simulated Microsoft Dynamics 365 / Salesforce CRM customer profile.
 */
async function getCustomerProfile(req, res, next) {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });

        const profile = {
            customerId: user._id,
            name: user.name,
            email: user.email,
            segment: user.preferences?.budget === 'premium' ? 'High Value' : 'Standard',
            lifetimeValue: Math.floor(Math.random() * 5000) + 500,
            totalOrders: Math.floor(Math.random() * 20) + 1,
            avgOrderValue: Math.floor(Math.random() * 300) + 50,
            loyaltyTier: user.loyaltyTokens > 100 ? 'Platinum' : user.loyaltyTokens > 50 ? 'Gold' : 'Silver',
            loyaltyTokens: user.loyaltyTokens || 0,
            preferences: user.preferences || {},
            engagementScore: Math.floor(Math.random() * 30) + 70,
            lastVisit: new Date().toISOString(),
            recommendedActions: [
                'Send personalized offer based on browsing history',
                'Invite to VR store exclusive event',
                'Offer loyalty token redemption for next purchase',
            ],
            channelPreference: 'VR Store',
            riskScore: Math.floor(Math.random() * 20) + 5,
            nps: Math.floor(Math.random() * 4) + 7,
            source: 'Microsoft Dynamics 365 / Salesforce CRM Integration',
        };

        return res.json({ success: true, profile });
    } catch (err) { next(err); }
}

/**
 * GET /api/crm/insights/:productId
 * Product-level CRM insights for digital display and sales staff.
 */
async function getProductInsights(req, res, next) {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const insights = {
            productId: product._id,
            productName: product.name,
            ...(product.crmInsights || {}),
            realtimeViewers: Math.floor(Math.random() * 50) + 5,
            weeklyViews: Math.floor(Math.random() * 500) + 100,
            addToCartRate: (Math.random() * 15 + 5).toFixed(1),
            returnRate: (Math.random() * 5 + 1).toFixed(1),
            sentimentScore: (Math.random() * 2 + 3).toFixed(1),
            topSearchTerms: product.tags?.slice(0, 3) || [],
            crossSellProducts: [],
            salesTrend: 'increasing',
            inventoryStatus: product.stock > 20 ? 'healthy' : product.stock > 5 ? 'low' : 'critical',
            source: 'CRM Analytics Engine (Dynamics 365)',
        };

        return res.json({ success: true, insights });
    } catch (err) { next(err); }
}

/**
 * POST /api/crm/track-interaction
 * Log customer interaction events for CRM pipeline.
 */
async function trackInteraction(req, res, next) {
    try {
        const { userId, productId, interactionType, metadata } = req.body;
        logger.info(`CRM Interaction: ${interactionType} by ${userId} on ${productId}`, metadata);
        return res.json({ success: true, message: 'Interaction tracked', timestamp: new Date().toISOString() });
    } catch (err) { next(err); }
}

module.exports = { getCustomerProfile, getProductInsights, trackInteraction };
