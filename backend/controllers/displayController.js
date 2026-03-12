const Product = require('../models/Product');

/**
 * GET /api/display/kiosk/:productId
 * Returns kiosk-mode data for digital display units (tablets/screens in-store).
 */
async function getKioskData(req, res, next) {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const kioskData = {
            product: {
                id: product._id,
                name: product.name,
                brand: product.brand,
                description: product.description,
                price: product.price,
                originalPrice: product.originalPrice,
                currency: product.currency || 'USD',
                images: product.images,
                model3DUrl: product.model3DUrl,
                specifications: product.specifications,
                rating: product.rating,
                reviewCount: product.reviewCount,
                colors: product.colors,
                sizes: product.sizes,
                isAuthenticated: product.isAuthenticated,
                blockchainCertificateHash: product.blockchainCertificateHash,
            },
            display: {
                mode: 'kiosk',
                autoRotateImages: true,
                slideInterval: 8000,
                showQRCode: true,
                qrCodeUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/products/${product.category}/${product._id}`,
                promotionalText: product.originalPrice ? `Save ${Math.round((1 - product.price / product.originalPrice) * 100)}%!` : null,
                callToAction: 'Scan QR to explore in AR',
                badges: [
                    product.isAuthenticated && 'Blockchain Verified',
                    product.arEnabled && 'AR Ready',
                    product.model3DUrl && '3D Interactive',
                    product.newArrival && 'New Arrival',
                ].filter(Boolean),
            },
            source: 'Digital Display Unit API',
        };

        return res.json({ success: true, kioskData });
    } catch (err) { next(err); }
}

/**
 * GET /api/display/catalog/:category
 * Returns display-optimized catalog for in-store digital screens.
 */
async function getDisplayCatalog(req, res, next) {
    try {
        const products = await Product.find({
            category: req.params.category,
            isActive: true,
        })
            .sort({ showcase: -1, featured: -1, rating: -1 })
            .limit(20)
            .select('name brand price originalPrice thumbnailUrl images rating reviewCount arEnabled displayMode showcase tags');

        return res.json({ success: true, products, displayMode: 'catalog', category: req.params.category });
    } catch (err) { next(err); }
}

module.exports = { getKioskData, getDisplayCatalog };
