const mongoose = require('mongoose');

/**
 * EmotionLog schema for persisting per-session real-time emotion snapshots.
 * Used for heatmap, timeline, and emotion-to-purchase correlation analysis.
 */
const emotionLogSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true, index: true },
        emotion: {
            type: String,
            enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'],
            required: true,
        },
        confidence: { type: Number, min: 0, max: 1, required: true },
        dominantEmotions: [
            {
                emotion: { type: String },
                score: { type: Number },
            },
        ],
        zone: { type: String, default: null }, // Which VR zone was user in
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
);

emotionLogSchema.index({ sessionId: 1, timestamp: 1 });

module.exports = mongoose.model('EmotionLog', emotionLogSchema);
