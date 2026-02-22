const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * GET /api/products
 * List products with optional filtering, sorting, and pagination.
 */
async function getProducts(req, res, next) {
    try {
        const { category, subcategory, minPrice, maxPrice, search, sort = 'createdAt', page = 1, limit = 20, featured } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (subcategory) query.subcategory = subcategory;
        if (featured === 'true') query.featured = true;
        if (minPrice || maxPrice) query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        if (search) query.$text = { $search: search };

        const products = await Product.find(query)
            .sort(sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { [sort]: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .select('-reviews');

        const total = await Product.countDocuments(query);
        return res.json({ success: true, products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (err) { next(err); }
}

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
async function getProductById(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.json({ success: true, product });
    } catch (err) { next(err); }
}

/**
 * GET /api/products/category/:cat
 * List products by category.
 */
async function getByCategory(req, res, next) {
    try {
        const products = await Product.find({ category: req.params.cat, isActive: true })
            .sort({ featured: -1, rating: -1 })
            .limit(50)
            .select('-reviews');
        return res.json({ success: true, products });
    } catch (err) { next(err); }
}

/**
 * POST /api/products
 * Create a new product (admin only).
 */
async function createProduct(req, res, next) {
    try {
        const product = new Product(req.body);
        await product.save();
        logger.info(`Product created: ${product.name}`);
        return res.status(201).json({ success: true, product });
    } catch (err) { next(err); }
}

/**
 * PUT /api/products/:id
 * Update a product (admin only).
 */
async function updateProduct(req, res, next) {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.json({ success: true, product });
    } catch (err) { next(err); }
}

/**
 * POST /api/products/:id/seed-demo
 * Seed 20 demo products for each category (admin only).
 */
async function seedDemoProducts(req, res, next) {
    try {
        const categories = ['fashion', 'electronics', 'furniture', 'accessories'];
        const products = [];

        const demoData = {
            fashion: [
                { name: 'Urban Jacket', price: 129.99, description: 'Stylish urban jacket for modern explorers.', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'Navy', hex: '#001F5B' }] },
                { name: 'Slim Fit Chinos', price: 79.99, description: 'Premium slim fit chinos for any occasion.', sizes: ['28', '30', '32', '34', '36'], colors: [{ name: 'Khaki', hex: '#C3B090' }, { name: 'Olive', hex: '#6B6B44' }] },
                { name: 'Casual Sneakers', price: 99.99, description: 'Lightweight everyday sneakers.', sizes: ['7', '8', '9', '10', '11'], colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Grey', hex: '#888888' }] },
                { name: 'Floral Summer Dress', price: 59.99, description: 'Elegant floral print summer dress.', sizes: ['XS', 'S', 'M', 'L'], colors: [{ name: 'Blue', hex: '#2196F3' }, { name: 'Pink', hex: '#E91E63' }] },
                { name: 'Wool Blazer', price: 199.99, description: 'Classic wool blazer with modern cut.', sizes: ['S', 'M', 'L', 'XL'], colors: [{ name: 'Charcoal', hex: '#36454F' }, { name: 'Camel', hex: '#C19A6B' }] },
            ],
            electronics: [
                { name: 'ProBook Ultra Laptop', price: 1299.99, description: '15-inch laptop with 12-core CPU, 32GB RAM, RTX 4070.', specifications: { cpu: '12-core', ram: '32GB', storage: '1TB NVMe', display: '15.6" OLED 4K' } },
                { name: 'Galaxy Pro Smartphone', price: 899.99, description: 'Flagship smartphone with 200MP camera and 5000mAh battery.', specifications: { display: '6.7" AMOLED', camera: '200MP', battery: '5000mAh', storage: '256GB' } },
                { name: 'Noise-Cancel Pro Headphones', price: 349.99, description: 'Studio-grade active noise cancellation headphones.', specifications: { type: 'Over-Ear ANC', battery: '30hr', connectivity: 'Bluetooth 5.3' } },
                { name: '4K Smart Monitor', price: 499.99, description: '32-inch 4K IPS monitor with 144Hz refresh rate.', specifications: { resolution: '3840x2160', refresh: '144Hz', panel: 'IPS', ports: 'USB-C, HDMI, DP' } },
                { name: 'Wireless Charging Pad', price: 49.99, description: '15W fast wireless charger for Qi-compatible devices.', specifications: { power: '15W', compatibility: 'Universal Qi' } },
            ],
            furniture: [
                { name: 'Ergonomic Office Chair', price: 399.99, description: 'Full lumbar support ergonomic chair with adjustable armrests.', specifications: { material: 'Mesh', maxLoad: '150kg', adjustable: true } },
                { name: 'Minimalist Coffee Table', price: 249.99, description: 'Scandinavian-style oak veneer coffee table.', specifications: { dimensions: '120x60x45cm', material: 'Oak Veneer' }, colors: [{ name: 'Natural Oak', hex: '#D2A679' }, { name: 'Walnut', hex: '#5C3D2E' }] },
                { name: 'L-Shape Sectional Sofa', price: 1299.99, description: 'Modern L-shaped sectional with chaise lounge.', specifications: { material: 'Velvet', seats: 5 }, colors: [{ name: 'Emerald', hex: '#2E7D32' }, { name: 'Charcoal', hex: '#37474F' }] },
                { name: 'Floating Bookshelf', price: 129.99, description: 'Wall-mounted floating bookshelf set of 3.', specifications: { material: 'MDF + Steel', loadCapacity: '15kg each' } },
                { name: 'King Bed Frame', price: 699.99, description: 'Upholstered king bed frame with storage drawers.', specifications: { size: 'King (180x200cm)', material: 'Linen', storage: '4 drawers' }, colors: [{ name: 'Stone Grey', hex: '#9E9E9E' }, { name: 'Midnight Blue', hex: '#1A237E' }] },
            ],
            accessories: [
                { name: 'Smart Watch Pro', price: 299.99, description: 'Health tracking smartwatch with ECG and blood oxygen.', specifications: { display: '1.9" AMOLED', battery: '7 days', sensors: 'ECG, SpO2, GPS' } },
                { name: 'Leather Backpack', price: 149.99, description: 'Genuine leather laptop backpack with USB port.', specifications: { capacity: '25L', laptopSize: 'Up to 15"' }, colors: [{ name: 'Brown', hex: '#795548' }, { name: 'Black', hex: '#212121' }] },
                { name: 'Polarized Sunglasses', price: 89.99, description: 'UV400 polarized sunglasses with titanium frame.', specifications: { lensType: 'Polarized', uvProtection: 'UV400' }, colors: [{ name: 'Gold', hex: '#FFD700' }, { name: 'Silver', hex: '#C0C0C0' }] },
                { name: 'Minimalist Wallet', price: 39.99, description: 'RFID-blocking slim cardholder wallet.', specifications: { cards: '12 slots', material: 'Genuine Leather' }, colors: [{ name: 'Tan', hex: '#D2691E' }, { name: 'Black', hex: '#1A1A1A' }] },
                { name: 'Scented Candle Set', price: 34.99, description: 'Luxury soy wax scented candles, set of 3.', specifications: { burnTime: '50hr each', scents: 'Lavender, Vanilla, Sandalwood' } },
            ],
        };

        for (const [cat, items] of Object.entries(demoData)) {
            for (const item of items) {
                products.push({
                    ...item,
                    category: cat,
                    vrZone: cat,
                    brand: 'VR Retail',
                    rating: (Math.random() * 2 + 3).toFixed(1),
                    reviewCount: Math.floor(Math.random() * 200) + 10,
                    featured: Math.random() > 0.6,
                    newArrival: Math.random() > 0.7,
                    isAuthenticated: Math.random() > 0.5,
                    thumbnailUrl: `https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}`,
                    vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
                });
            }
        }

        await Product.insertMany(products);
        return res.json({ success: true, message: `${products.length} demo products seeded` });
    } catch (err) { next(err); }
}

module.exports = { getProducts, getProductById, getByCategory, createProduct, updateProduct, seedDemoProducts };
