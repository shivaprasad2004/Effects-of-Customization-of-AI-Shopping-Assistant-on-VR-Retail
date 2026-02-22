const User = require('../models/User');
const Session = require('../models/Session');
const logger = require('../utils/logger');

/**
 * GET /api/users/profile
 * Return the authenticated user's profile.
 */
async function getProfile(req, res, next) {
    try {
        const user = await User.findById(req.user.id).populate('purchaseHistory.productId', 'name images price');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.json({ success: true, user: user.toPublic() });
    } catch (err) { next(err); }
}

/**
 * PUT /api/users/profile
 * Update name, preferences, avatar, wallet address, etc.
 */
async function updateProfile(req, res, next) {
    try {
        const allowed = ['name', 'age', 'gender', 'preferences', 'avatar', 'walletAddress', 'emotionConsentGiven'];
        const updates = {};
        allowed.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

        const user = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true, runValidators: true });
        return res.json({ success: true, user: user.toPublic() });
    } catch (err) { next(err); }
}

/**
 * POST /api/users/onboarding
 * Complete the onboarding quiz; save preferences.
 */
async function completeOnboarding(req, res, next) {
    try {
        const { categories, budgetRange, style, language, theme } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { preferences: { categories, budgetRange, style, language, theme }, onboardingComplete: true } },
            { new: true }
        );
        return res.json({ success: true, user: user.toPublic() });
    } catch (err) { next(err); }
}

/**
 * GET /api/users/sessions
 * Return paginated session history for the authenticated user.
 */
async function getUserSessions(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sessions = await Session.find({ userId: req.user.id })
            .sort({ startTime: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-chatbotInteractions -emotionLog');
        const total = await Session.countDocuments({ userId: req.user.id });
        return res.json({ success: true, sessions, total, page, pages: Math.ceil(total / limit) });
    } catch (err) { next(err); }
}

/**
 * DELETE /api/users/account
 * Soft-delete (deactivate) the user account.
 */
async function deleteAccount(req, res, next) {
    try {
        await User.findByIdAndUpdate(req.user.id, { isActive: false, email: `deleted_${Date.now()}_${req.user.id}` });
        logger.info(`Account deleted: ${req.user.id}`);
        return res.json({ success: true, message: 'Account deactivated' });
    } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, completeOnboarding, getUserSessions, deleteAccount };
