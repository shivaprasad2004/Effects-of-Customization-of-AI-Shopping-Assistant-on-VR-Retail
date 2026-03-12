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

        // Real-time feature: Inject dynamic stock alerts and simulated live viewer counts
        const enrichedProducts = products.map(p => {
            const product = p.toObject();
            // Simulate live viewers for real-time feel
            product.liveViewers = Math.floor(Math.random() * 50) + 5;
            // Add low stock flag if below 10
            product.lowStock = product.stock > 0 && product.stock < 10;
            return product;
        });

        const total = await Product.countDocuments(query);
        return res.json({ success: true, products: enrichedProducts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
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

/**
 * POST /api/products/:id/review
 * Add a review to a product and update its overall rating.
 */
async function addReview(req, res, next) {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        // Add the review
        product.reviews.push({ userId, rating, comment });
        
        // Update average rating and review count
        const totalRating = product.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        product.reviewCount = product.reviews.length;
        product.rating = parseFloat((totalRating / product.reviewCount).toFixed(1));

        await product.save();
        logger.info(`Review added to product ${productId} by user ${userId}`);

        return res.json({ success: true, rating: product.rating, reviewCount: product.reviewCount });
    } catch (err) { next(err); }
}

/**
 * GET /api/products/showcase
 * Get showcase products with full tech capabilities.
 */
async function getShowcaseProducts(req, res, next) {
    try {
        const products = await Product.find({ showcase: true, isActive: true })
            .sort({ category: 1, rating: -1 });
        return res.json({ success: true, products });
    } catch (err) { next(err); }
}

/**
 * GET /api/products/:id/configurator
 * Get configurator options for a product.
 */
async function getConfiguratorOptions(req, res, next) {
    try {
        const product = await Product.findById(req.params.id).select('name configuratorOptions model3DConfig model3DUrl images');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        return res.json({ success: true, configurator: product });
    } catch (err) { next(err); }
}

/**
 * GET /api/products/:id/ar-data
 * Get AR-specific data for a product.
 */
async function getARData(req, res, next) {
    try {
        const product = await Product.findById(req.params.id).select('name arEnabled arType model3DUrl model3DConfig images price');
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
        if (!product.arEnabled) return res.status(400).json({ success: false, message: 'AR not available for this product' });
        return res.json({ success: true, arData: product });
    } catch (err) { next(err); }
}

/**
 * POST /api/products/seed-showcase
 * Seed 9 showcase products demonstrating all technologies.
 */
async function seedShowcaseProducts(req, res, next) {
    try {
        await Product.deleteMany({ showcase: true });

        const showcaseProducts = [
            // ── FASHION ──────────────────────────────────────────
            {
                name: 'Royal Enfield Leather Jacket',
                category: 'fashion',
                subcategory: 'men',
                description: 'Premium handcrafted leather jacket inspired by Royal Enfield heritage. Features genuine leather construction with quilted lining, multiple pockets, and CE-certified armor inserts. Perfect for riders and urban style enthusiasts.',
                price: 249.99,
                originalPrice: 329.99,
                images: [
                    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
                    'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800',
                    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
                model3DUrl: '/models/leather-jacket.glb',
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: [{ name: 'Midnight Black', hex: '#1A1A1A' }, { name: 'Vintage Brown', hex: '#6B3A2A' }, { name: 'Desert Tan', hex: '#C4A882' }],
                brand: 'Royal Enfield',
                tags: ['leather', 'jacket', 'rider', 'premium', 'configurator'],
                rating: 4.8,
                reviewCount: 342,
                stock: 45,
                specifications: { material: 'Genuine Cowhide Leather', lining: 'Quilted Polyester', weight: '2.5kg', armor: 'CE Level 1' },
                vrZone: 'fashion',
                vrPosition: { x: -5, y: 1.2, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0xABC123DEF456789...',
                ipfsCertificateUrl: 'ipfs://QmXoYpZi...',
                showcase: true,
                featured: true,
                newArrival: true,
                arEnabled: true,
                arType: 'try-on',
                displayMode: 'configurator',
                configuratorOptions: {
                    colors: [
                        { name: 'Midnight Black', hex: '#1A1A1A' },
                        { name: 'Vintage Brown', hex: '#6B3A2A' },
                        { name: 'Desert Tan', hex: '#C4A882' },
                    ],
                    materials: [
                        { name: 'Genuine Leather', texture: 'leather', roughness: 0.8, metalness: 0 },
                        { name: 'Vegan Leather', texture: 'vegan-leather', roughness: 0.6, metalness: 0.05 },
                        { name: 'Suede', texture: 'suede', roughness: 0.95, metalness: 0 },
                    ],
                    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                },
                model3DConfig: { defaultColor: '#1A1A1A', defaultMaterial: 'leather', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Men 25-45, Motorcycle Enthusiasts', conversionRate: 12.5, engagementScore: 92, avgSessionTime: 185, demographics: 'Urban Professionals' },
            },
            {
                name: 'Designer Aviator Sunglasses',
                category: 'fashion',
                subcategory: 'accessories',
                description: 'Titanium frame aviator sunglasses with polarized gradient lenses. UV400 protection with anti-scratch coating. Includes AR virtual try-on for perfect fit visualization.',
                price: 159.99,
                originalPrice: 199.99,
                images: [
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
                    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800',
                    'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
                model3DUrl: '/models/aviator-sunglasses.glb',
                sizes: ['One Size'],
                colors: [{ name: 'Gold Frame', hex: '#FFD700' }, { name: 'Silver Frame', hex: '#C0C0C0' }, { name: 'Gunmetal', hex: '#2C3539' }],
                brand: 'LuxeVision',
                tags: ['sunglasses', 'aviator', 'AR-try-on', 'premium'],
                rating: 4.6,
                reviewCount: 218,
                stock: 78,
                specifications: { frame: 'Titanium', lens: 'Polarized CR-39', uvProtection: 'UV400', weight: '28g' },
                vrZone: 'fashion',
                vrPosition: { x: -3, y: 1.5, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0xDEF789ABC123456...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: 'try-on',
                displayMode: 'standard',
                model3DConfig: { defaultColor: '#FFD700', defaultMaterial: 'metal', rotatable: true, scalable: false },
                crmInsights: { targetAudience: 'Fashion-conscious Adults 20-40', conversionRate: 18.3, engagementScore: 87, avgSessionTime: 95, demographics: 'Premium Shoppers' },
            },
            {
                name: 'Luxury Chronograph Smartwatch',
                category: 'fashion',
                subcategory: 'accessories',
                description: 'Hybrid luxury smartwatch combining Swiss chronograph design with health tracking technology. AMOLED display, sapphire crystal, titanium case. Features ECG, SpO2, and 14-day battery life.',
                price: 449.99,
                originalPrice: 549.99,
                images: [
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=800',
                    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                model3DUrl: '/models/smartwatch.glb',
                sizes: ['42mm', '46mm'],
                colors: [{ name: 'Obsidian', hex: '#0B0B0B' }, { name: 'Lunar Silver', hex: '#D4D4D8' }, { name: 'Rose Gold', hex: '#E8B4B8' }],
                brand: 'ChronoTech',
                tags: ['smartwatch', 'luxury', 'digital-display', '360-view'],
                rating: 4.9,
                reviewCount: 567,
                stock: 23,
                specifications: { display: '1.43" AMOLED 466x466', battery: '14 days', sensors: 'ECG, SpO2, GPS, Altimeter', waterResistance: '5ATM', case: 'Grade 5 Titanium' },
                vrZone: 'fashion',
                vrPosition: { x: -1, y: 1.3, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0x456789ABC123DEF...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: '360-view',
                displayMode: 'kiosk',
                model3DConfig: { defaultColor: '#0B0B0B', defaultMaterial: 'titanium', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Tech-savvy Professionals 30-55', conversionRate: 8.7, engagementScore: 95, avgSessionTime: 240, demographics: 'High Income Urban' },
            },

            // ── ELECTRONICS ──────────────────────────────────────
            {
                name: 'Smart ANC Headphones Pro',
                category: 'electronics',
                subcategory: 'audio-video',
                description: 'Studio-grade adaptive noise cancellation headphones with spatial audio. 40mm planar magnetic drivers, 60-hour battery, and AI-powered sound personalization. Customize your color and material in our 3D configurator.',
                price: 379.99,
                originalPrice: 449.99,
                images: [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
                    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800',
                    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                model3DUrl: '/models/headphones.glb',
                sizes: ['One Size'],
                colors: [{ name: 'Matte Black', hex: '#2D2D2D' }, { name: 'Arctic Silver', hex: '#E8E8E8' }, { name: 'Rose Gold', hex: '#D4A574' }],
                brand: 'SoundSphere',
                tags: ['headphones', 'ANC', 'configurator', 'spatial-audio'],
                rating: 4.7,
                reviewCount: 891,
                stock: 156,
                specifications: { drivers: '40mm Planar Magnetic', anc: 'Adaptive Hybrid ANC', battery: '60 hours', codec: 'LDAC, aptX HD, AAC', connectivity: 'Bluetooth 5.3 + 3.5mm' },
                vrZone: 'electronics',
                vrPosition: { x: 5, y: 1.2, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0x789ABCDEF123456...',
                showcase: true,
                featured: true,
                arEnabled: false,
                displayMode: 'configurator',
                configuratorOptions: {
                    colors: [
                        { name: 'Matte Black', hex: '#2D2D2D' },
                        { name: 'Arctic Silver', hex: '#E8E8E8' },
                        { name: 'Rose Gold', hex: '#D4A574' },
                        { name: 'Midnight Blue', hex: '#191970' },
                    ],
                    materials: [
                        { name: 'Premium Plastic', texture: 'matte', roughness: 0.7, metalness: 0.1 },
                        { name: 'Brushed Aluminum', texture: 'metal', roughness: 0.3, metalness: 0.9 },
                        { name: 'Carbon Fiber', texture: 'carbon', roughness: 0.4, metalness: 0.3 },
                    ],
                    sizes: ['One Size'],
                },
                model3DConfig: { defaultColor: '#2D2D2D', defaultMaterial: 'matte', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Audiophiles & Remote Workers 20-45', conversionRate: 15.2, engagementScore: 88, avgSessionTime: 165, demographics: 'Tech Enthusiasts' },
            },
            {
                name: 'UltraBook Pro 16" Laptop',
                category: 'electronics',
                subcategory: 'computers',
                description: 'Next-gen ultrabook with M3 Max chip, 36GB unified memory, 16" Liquid Retina XDR display. Use AR to see it on your desk before buying. Perfect for creators and professionals.',
                price: 2499.99,
                originalPrice: 2799.99,
                images: [
                    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                model3DUrl: '/models/laptop.glb',
                sizes: ['16 inch'],
                colors: [{ name: 'Space Black', hex: '#1D1D1F' }, { name: 'Silver', hex: '#E3E3E3' }],
                brand: 'TechNova',
                tags: ['laptop', 'ultrabook', 'AR-placement', 'digital-display'],
                rating: 4.9,
                reviewCount: 1243,
                stock: 34,
                specifications: { chip: 'M3 Max 16-core', memory: '36GB Unified', storage: '1TB SSD', display: '16.2" Liquid Retina XDR', battery: '22 hours', weight: '2.14kg' },
                vrZone: 'electronics',
                vrPosition: { x: 7, y: 1.0, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0xFED987654321ABC...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: 'room-placement',
                displayMode: 'kiosk',
                model3DConfig: { defaultColor: '#1D1D1F', defaultMaterial: 'aluminum', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Creative Professionals 25-50', conversionRate: 6.8, engagementScore: 96, avgSessionTime: 320, demographics: 'High-Income Creators' },
            },
            {
                name: 'Mirrorless Camera Elite',
                category: 'electronics',
                subcategory: 'cameras',
                description: 'Full-frame 61MP mirrorless camera with 8K video, in-body stabilization, and AI-powered autofocus. Experience every detail through our digital display kiosk and 360° product viewer.',
                price: 3299.99,
                originalPrice: 3699.99,
                images: [
                    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
                    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
                    'https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
                model3DUrl: '/models/camera.glb',
                sizes: ['Body Only', 'With 24-70mm Kit Lens'],
                colors: [{ name: 'Professional Black', hex: '#1A1A1A' }],
                brand: 'OptiPro',
                tags: ['camera', 'mirrorless', 'digital-display', '360-view', 'professional'],
                rating: 4.8,
                reviewCount: 456,
                stock: 18,
                specifications: { sensor: '61MP Full-Frame BSI CMOS', video: '8K 30fps / 4K 120fps', iso: '100-51200', af: '759 Phase Detection Points', stabilization: '5-axis IBIS 8-stop', weight: '735g' },
                vrZone: 'electronics',
                vrPosition: { x: 9, y: 1.3, z: -3 },
                isAuthenticated: true,
                blockchainCertificateHash: '0x321ABCDEF987654...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: '360-view',
                displayMode: 'kiosk',
                model3DConfig: { defaultColor: '#1A1A1A', defaultMaterial: 'plastic-metal', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Professional Photographers & Videographers', conversionRate: 4.2, engagementScore: 97, avgSessionTime: 450, demographics: 'Creative Industry Professionals' },
            },

            // ── FURNITURE ────────────────────────────────────────
            {
                name: 'Modern L-Shape Sofa',
                category: 'furniture',
                subcategory: 'living',
                description: 'Luxurious modular L-shape sofa with premium velvet upholstery. Features adjustable headrests, built-in USB charging, and under-seat storage. Use AR to place it in your living room before purchase.',
                price: 1899.99,
                originalPrice: 2299.99,
                images: [
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
                    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
                    'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400',
                model3DUrl: '/models/l-sofa.glb',
                sizes: ['Left Chaise', 'Right Chaise'],
                colors: [{ name: 'Emerald Green', hex: '#2E7D32' }, { name: 'Charcoal Grey', hex: '#37474F' }, { name: 'Navy Blue', hex: '#1A237E' }],
                brand: 'CasaModerna',
                tags: ['sofa', 'modular', 'AR-placement', 'configurator', 'living-room'],
                rating: 4.7,
                reviewCount: 198,
                stock: 12,
                specifications: { dimensions: '285cm x 185cm x 88cm', material: 'Premium Velvet', frame: 'Solid Hardwood', seats: '5-6 persons', weight: '95kg', features: 'USB Charging, Storage' },
                vrZone: 'furniture',
                vrPosition: { x: 0, y: 0, z: 5 },
                isAuthenticated: true,
                blockchainCertificateHash: '0xABC789DEF456123...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: 'room-placement',
                displayMode: 'configurator',
                configuratorOptions: {
                    colors: [
                        { name: 'Emerald Green', hex: '#2E7D32' },
                        { name: 'Charcoal Grey', hex: '#37474F' },
                        { name: 'Navy Blue', hex: '#1A237E' },
                        { name: 'Blush Pink', hex: '#E8B4B8' },
                    ],
                    materials: [
                        { name: 'Premium Velvet', texture: 'velvet', roughness: 0.9, metalness: 0 },
                        { name: 'Italian Leather', texture: 'leather', roughness: 0.7, metalness: 0.05 },
                        { name: 'Linen Blend', texture: 'linen', roughness: 0.85, metalness: 0 },
                    ],
                    sizes: ['Left Chaise', 'Right Chaise'],
                },
                model3DConfig: { defaultColor: '#2E7D32', defaultMaterial: 'velvet', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Homeowners 28-55, Interior Enthusiasts', conversionRate: 7.3, engagementScore: 91, avgSessionTime: 280, demographics: 'Mid-to-High Income Families' },
            },
            {
                name: 'Motorized Standing Desk Pro',
                category: 'furniture',
                subcategory: 'office',
                description: 'Electric height-adjustable standing desk with dual motors, memory presets, and cable management system. Customize your desktop material and frame color in our 3D configurator.',
                price: 799.99,
                originalPrice: 999.99,
                images: [
                    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
                    'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800',
                    'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400',
                model3DUrl: '/models/standing-desk.glb',
                sizes: ['140cm x 70cm', '160cm x 80cm', '180cm x 80cm'],
                colors: [{ name: 'Bamboo Natural', hex: '#D4A76A' }, { name: 'Walnut Dark', hex: '#5C3D2E' }, { name: 'White Matte', hex: '#F5F5F5' }],
                brand: 'ErgoLift',
                tags: ['desk', 'standing', 'motorized', 'configurator', 'ergonomic'],
                rating: 4.6,
                reviewCount: 334,
                stock: 67,
                specifications: { heightRange: '62cm - 127cm', motors: 'Dual Motor', speed: '38mm/s', loadCapacity: '120kg', noise: '<45dB', presets: '4 Memory Presets' },
                vrZone: 'furniture',
                vrPosition: { x: 2, y: 0, z: 5 },
                isAuthenticated: true,
                blockchainCertificateHash: '0xDEF123ABC456789...',
                showcase: true,
                featured: true,
                arEnabled: false,
                displayMode: 'configurator',
                configuratorOptions: {
                    colors: [
                        { name: 'Bamboo Natural', hex: '#D4A76A' },
                        { name: 'Walnut Dark', hex: '#5C3D2E' },
                        { name: 'White Matte', hex: '#F5F5F5' },
                        { name: 'Black Oak', hex: '#2C2C2C' },
                    ],
                    materials: [
                        { name: 'Bamboo', texture: 'bamboo', roughness: 0.6, metalness: 0 },
                        { name: 'Solid Walnut', texture: 'walnut', roughness: 0.65, metalness: 0 },
                        { name: 'Laminate', texture: 'laminate', roughness: 0.3, metalness: 0.1 },
                    ],
                    sizes: ['140cm x 70cm', '160cm x 80cm', '180cm x 80cm'],
                },
                model3DConfig: { defaultColor: '#D4A76A', defaultMaterial: 'bamboo', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Remote Workers & Health-Conscious Professionals', conversionRate: 11.4, engagementScore: 89, avgSessionTime: 200, demographics: 'Tech Workers 25-45' },
            },
            {
                name: 'Floating Modular Bookshelf',
                category: 'furniture',
                subcategory: 'decor',
                description: 'Award-winning wall-mounted modular bookshelf system. Mix and match configurations with magnetic mounting. View in 360° and use AR to visualize on your wall.',
                price: 349.99,
                originalPrice: 449.99,
                images: [
                    'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
                    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800',
                ],
                thumbnailUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400',
                model3DUrl: '/models/bookshelf.glb',
                sizes: ['3-Module Set', '5-Module Set', '7-Module Set'],
                colors: [{ name: 'Natural Oak', hex: '#D2A679' }, { name: 'Matte White', hex: '#F0F0F0' }, { name: 'Espresso', hex: '#3C2415' }],
                brand: 'ShelfArt',
                tags: ['bookshelf', 'floating', 'modular', 'AR-view', '360-view'],
                rating: 4.5,
                reviewCount: 156,
                stock: 89,
                specifications: { modules: 'Configurable 3/5/7', material: 'Solid Oak + Steel Brackets', loadPerModule: '15kg', mounting: 'Magnetic + Wall Anchor', finish: 'Matte Lacquer' },
                vrZone: 'furniture',
                vrPosition: { x: 4, y: 1.5, z: 5 },
                isAuthenticated: true,
                blockchainCertificateHash: '0x654321ABCDEF789...',
                showcase: true,
                featured: true,
                arEnabled: true,
                arType: '360-view',
                displayMode: 'standard',
                model3DConfig: { defaultColor: '#D2A679', defaultMaterial: 'oak', rotatable: true, scalable: true },
                crmInsights: { targetAudience: 'Design-Conscious Homeowners 25-50', conversionRate: 14.1, engagementScore: 84, avgSessionTime: 150, demographics: 'Urban Dwellers' },
            },
        ];

        await Product.insertMany(showcaseProducts);
        logger.info(`${showcaseProducts.length} showcase products seeded`);
        return res.json({ success: true, message: `${showcaseProducts.length} showcase products seeded`, products: showcaseProducts });
    } catch (err) { next(err); }
}

module.exports = { getProducts, getProductById, getByCategory, createProduct, updateProduct, seedDemoProducts, seedShowcaseProducts, addReview, getShowcaseProducts, getConfiguratorOptions, getARData };
