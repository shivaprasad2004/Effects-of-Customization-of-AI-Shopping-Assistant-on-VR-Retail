const mongoose = require('mongoose');

/**
 * Product schema supporting 3D models, multiple variants,
 * blockchain certificates, and AI-ready specification data.
 */
const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, index: true },
        category: {
            type: String,
            required: true,
            enum: [
                'fashion',
                'electronics',
                'furniture',
                'accessories',
                'home',
                'beauty',
                'baby_kids',
                'pets',
                'niche'
            ],
            index: true,
        },
        subcategory: { type: String, trim: true },
        description: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        originalPrice: { type: Number },
        currency: { type: String, default: 'USD' },
        images: [{ type: String }], // S3 URLs
        model3DUrl: { type: String }, // GLTF/GLB on S3
        thumbnailUrl: { type: String },
        specifications: { type: mongoose.Schema.Types.Mixed, default: {} },
        sizes: [{ type: String }],
        colors: [
            {
                name: { type: String },
                hex: { type: String },
                imageUrl: { type: String },
            },
        ],
        stock: { type: Number, default: 100 },
        tags: [{ type: String }],
        brand: { type: String },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
        reviews: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                rating: { type: Number, min: 1, max: 5 },
                comment: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
        // Blockchain authentication
        blockchainCertificateHash: { type: String, default: null },
        ipfsCertificateUrl: { type: String, default: null },
        isAuthenticated: { type: Boolean, default: false },
        manufacturer: { type: String },
        // VR positioning
        vrZone: {
            type: String,
            enum: ['fashion', 'electronics', 'furniture', 'checkout'],
        },
        vrPosition: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
            z: { type: Number, default: 0 },
        },
        isActive: { type: Boolean, default: true },
        featured: { type: Boolean, default: false },
        newArrival: { type: Boolean, default: false },
    },
    { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
