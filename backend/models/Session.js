const mongoose = require('mongoose');

/**
 * Session schema capturing the full lifecycle of a user's VR shopping session.
 * Supports research experiment tracking (Group A vs B).
 */
const sessionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        groupType: { type: String, enum: ['A', 'B'], required: true },
        status: {
            type: String,
            enum: ['active', 'paused', 'completed', 'abandoned'],
            default: 'active',
        },
        startTime: { type: Date, default: Date.now },
        endTime: { type: Date, default: null },
        duration: { type: Number, default: 0 }, // seconds

        // VR browsing behavior
        productsViewed: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                dwellTime: { type: Number, default: 0 }, // seconds
                timestamp: { type: Date, default: Date.now },
                zone: { type: String },
                interactions: { type: Number, default: 0 },
            },
        ],

        // AI chatbot interactions
        chatbotInteractions: [
            {
                query: { type: String },
                response: { type: String },
                intent: { type: String },
                timestamp: { type: Date, default: Date.now },
                recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
            },
        ],

        // Emotion tracking
        emotionLog: [
            {
                emotion: {
                    type: String,
                    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
                },
                confidence: { type: Number, min: 0, max: 1 },
                timestamp: { type: Date, default: Date.now },
                zone: { type: String },
            },
        ],

        // Purchases made during session
        purchases: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                amount: { type: Number },
                txHash: { type: String },
                timestamp: { type: Date, default: Date.now },
            },
        ],

        // Try-on events
        tryOnEvents: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                type: { type: String, enum: ['clothing', 'furniture', '360viewer'] },
                duration: { type: Number, default: 0 },
                purchased: { type: Boolean, default: false },
                timestamp: { type: Date, default: Date.now },
            },
        ],

        // Post-session survey
        surveyResponse: {
            csat: { type: Number, min: 1, max: 5 },
            trust: { type: Number, min: 1, max: 5 },
            easeOfUse: { type: Number, min: 1, max: 5 },
            recommendation: { type: Number, min: 1, max: 10 }, // NPS
            comments: { type: String },
            submittedAt: { type: Date },
        },

        // Computed research metrics (populated on session close)
        metrics: {
            conversionRate: { type: Number, default: 0 },
            engagementTime: { type: Number, default: 0 },
            taskCompletionTime: { type: Number, default: 0 },
            recommendationAcceptance: { type: Number, default: 0 },
            emotionDistribution: { type: mongoose.Schema.Types.Mixed, default: {} },
            zonesVisited: [{ type: String }],
            cartAbandonment: { type: Boolean, default: false },
        },
    },
    { timestamps: true }
);

sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ groupType: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
