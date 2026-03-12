require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../models/Product');

const images = {
  fashion: {
    men: [
      'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516826957135-700dedea6984?q=80&w=800&auto=format&fit=crop'
    ],
    women: [
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop'
    ],
    children: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop'
    ]
  },
  electronics: [
    'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=800&auto=format&fit=crop'
  ],
  furniture: [
    'https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=800&auto=format&fit=crop'
  ],
  accessories: [
    'https://images.unsplash.com/photo-1512314889357-e157c22f938d?q=80&w=800&auto=format&fit=crop'
  ]
};

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-retail';
  await mongoose.connect(uri);

  // Clear existing products first
  await Product.deleteMany({});
  console.log('Cleared existing products.');

  const products = [];

  const fashionItems = [
    { name: 'Classic Cotton Tee', subcategory: 'men', price: 999, description: 'Premium soft cotton T‑shirt for everyday comfort.' },
    { name: 'Slim Fit Denim', subcategory: 'men', price: 2499, description: 'Iconic indigo denim with a modern tapered fit.' },
    { name: 'Floral Summer Dress', subcategory: 'women', price: 1899, description: 'Breathable flowy floral dress for casual outings.' },
    { name: 'Designer Silk Saree', subcategory: 'women', price: 5499, description: 'Elegant hand-woven silk saree with traditional motifs.' },
    { name: 'Kids Graphic Hoodie', subcategory: 'children', price: 1299, description: 'Cozy and colorful hoodie for active play.' },
    { name: 'Comfort Walk Sneakers', subcategory: 'children', price: 1599, description: 'Durable, lightweight sneakers for school and play.' }
  ];

  for (const item of fashionItems) {
    const imgList = images.fashion[item.subcategory] || [];
    products.push({
      name: item.name,
      category: 'fashion',
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      images: imgList,
      thumbnailUrl: imgList[0] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(item.name)}`,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#111111' }, { name: 'Royal Blue', hex: '#002366' }],
      brand: 'VR Luxe',
      rating: 4.5, reviewCount: Math.floor(Math.random() * 500) + 50,
      featured: true,
      newArrival: true,
      isAuthenticated: true,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const electronicsItems = [
    { name: 'UltraHD 4K Smart TV', price: 45999, description: 'Immersive 55" OLED display with AI-powered upscaling.' },
    { name: 'ZenFlow Noise Cancelling Headphones', price: 12499, description: 'Active noise cancellation with 40-hour battery life.' },
    { name: 'Titan Gaming Pro Laptop', price: 89999, description: 'Next-gen graphics and lightning-fast refresh rate.' },
    { name: 'Smart Watch Series X', price: 5999, description: 'Health tracking and seamless connectivity on your wrist.' }
  ];
  for (const item of electronicsItems) {
    products.push({
      name: item.name,
      category: 'electronics',
      subcategory: 'gadgets',
      description: item.description,
      price: item.price,
      images: images.electronics,
      thumbnailUrl: images.electronics[0],
      specifications: { warranty: '1 Year' },
      brand: 'ElectroVR',
      rating: 4.8, reviewCount: Math.floor(Math.random() * 800) + 100,
      featured: true,
      newArrival: true,
      isAuthenticated: true,
      vrZone: 'electronics',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const furnitureItems = [
    { name: 'Velvet Cloud Sofa', price: 32999, description: 'Luxury 3‑seater with premium velvet finish.' },
    { name: 'Solid Teak Dining Table', price: 18499, description: 'Handcrafted teak wood table for family dinners.' },
    { name: 'ErgoMaster Office Chair', price: 8999, description: 'Ergonomic design for maximum productivity and comfort.' }
  ];
  for (const item of furnitureItems) {
    products.push({
      name: item.name,
      category: 'home',
      subcategory: 'living',
      description: item.description,
      price: item.price,
      images: images.furniture,
      thumbnailUrl: images.furniture[0],
      brand: 'Hearth & Home',
      rating: 4.6, reviewCount: Math.floor(Math.random() * 300) + 40,
      featured: true,
      newArrival: false,
      isAuthenticated: true,
      vrZone: 'furniture',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const beautyItems = [
    { name: 'Glow Essence Face Serum', price: 1299, description: 'Natural vitamin C serum for a radiant skin glow.', subcategory: 'skincare' },
    { name: 'Matte Perfection Lipstick', price: 899, description: 'Smudge-proof matte finish in iconic shades.', subcategory: 'makeup' }
  ];
  for (const item of beautyItems) {
    products.push({
      name: item.name,
      category: 'beauty',
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      images: ['https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop',
      brand: 'Aura Beauty',
      rating: 4.4, reviewCount: Math.floor(Math.random() * 600) + 100,
      featured: true,
      newArrival: true,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  await Product.insertMany(products);
  const totalCount = await Product.countDocuments();
  console.log(`Successfully seeded ${products.length} products with Rupee pricing. Total: ${totalCount}`);

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
