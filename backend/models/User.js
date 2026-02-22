const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema supporting participants, researchers, and admins.
 * Stores preferences, purchase history, and loyalty token balance.
 */
const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        passwordHash: { type: String },
        googleId: { type: String, sparse: true },
        age: { type: Number, min: 13, max: 120 },
        gender: { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'] },
        role: {
            type: String,
            enum: ['participant', 'researcher', 'admin'],
            default: 'participant',
        },
        groupType: {
            type: String,
            enum: ['A', 'B'],
            default: null, // Assigned on first session
        },
        preferences: {
            categories: { type: [String], default: [] },
            budgetRange: {
                min: { type: Number, default: 0 },
                max: { type: Number, default: 10000 },
            },
            style: { type: String, default: 'modern' },
            language: { type: String, default: 'en' },
            theme: { type: String, enum: ['futuristic', 'cozy', 'minimalist'], default: 'futuristic' },
            musicEnabled: { type: Boolean, default: true },
            fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
        },
        purchaseHistory: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                date: { type: Date, default: Date.now },
                amount: { type: Number },
                txHash: { type: String },
            },
        ],
        loyaltyTokens: { type: Number, default: 0 },
        walletAddress: { type: String, default: null },
        avatar: {
            skinTone: { type: String, default: '#F5CBA7' },
            hairColor: { type: String, default: '#2C3E50' },
            outfit: { type: String, default: 'casual' },
        },
        emotionConsentGiven: { type: Boolean, default: false },
        onboardingComplete: { type: Boolean, default: false },
        refreshToken: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });

/**
 * Hash password before saving if it has been modified.
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
});

/**
 * Compare a plain text password with the stored hash.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.passwordHash);
};

/**
 * Return a safe public profile (strips sensitive fields).
 * @returns {Object}
 */
userSchema.methods.toPublic = function () {
    const obj = this.toObject();
    delete obj.passwordHash;
    delete obj.refreshToken;
    delete obj.__v;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
