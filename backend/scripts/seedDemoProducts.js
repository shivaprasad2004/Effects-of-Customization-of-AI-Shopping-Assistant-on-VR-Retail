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

  const products = [];

  const fashionItems = [
    { name: 'Men Classic Tee', subcategory: 'men', price: 29.99, description: 'Soft cotton T‑shirt for everyday wear.' },
    { name: 'Men Denim Jacket', subcategory: 'men', price: 89.99, description: 'Iconic denim jacket with modern fit.' },
    { name: 'Women Summer Dress', subcategory: 'women', price: 59.99, description: 'Flowy floral dress for summer days.' },
    { name: 'Women Wool Coat', subcategory: 'women', price: 159.99, description: 'Warm wool coat, tailored silhouette.' },
    { name: 'Kids Hoodie', subcategory: 'children', price: 34.99, description: 'Cozy hoodie for boys and girls.' },
    { name: 'Kids Sneakers', subcategory: 'children', price: 49.99, description: 'Lightweight sneakers for active kids.' }
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
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Black', hex: '#111111' }, { name: 'Navy', hex: '#0B3D91' }],
      brand: 'VR Retail',
      rating: 4.3, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: Math.random() > 0.5,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const electronicsItems = [
    { name: '4K OLED TV', price: 1499.99, description: 'Ultra‑thin 55" OLED with HDR.' },
    { name: 'Noise Canceling Headphones', price: 299.99, description: 'ANC headphones with 30h battery.' },
    { name: 'Gaming Laptop', price: 1899.99, description: 'RTX graphics, high refresh display.' }
  ];
  for (const item of electronicsItems) {
    products.push({
      name: item.name,
      category: 'electronics',
      subcategory: 'audio-video',
      description: item.description,
      price: item.price,
      images: images.electronics,
      thumbnailUrl: images.electronics[0],
      specifications: { warranty: '2 years' },
      brand: 'VR Retail',
      rating: 4.5, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: Math.random() > 0.5,
      vrZone: 'electronics',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const furnitureItems = [
    { name: 'Modern Sofa', price: 999.99, description: '3‑seater with soft fabric upholstery.' },
    { name: 'Oak Dining Table', price: 599.99, description: 'Solid oak table for 6.' }
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
      brand: 'VR Retail',
      rating: 4.4, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: Math.random() > 0.5,
      vrZone: 'furniture',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const beautyItems = [
    { name: 'Hydrating Face Serum', price: 49.99, description: 'Hyaluronic acid serum for daily hydration.', subcategory: 'skincare' },
    { name: 'Volumizing Shampoo', price: 14.99, description: 'Sulfate‑free shampoo for fuller hair.', subcategory: 'haircare' },
    { name: 'Matte Lipstick', price: 19.99, description: 'Long‑lasting matte finish.', subcategory: 'makeup' }
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
      brand: 'VR Retail',
      rating: 4.2, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: false,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const babyKidsItems = [
    { name: 'Baby Stroller', price: 199.99, description: 'Lightweight, foldable stroller.', subcategory: 'nursery' },
    { name: 'Wooden Toy Set', price: 24.99, description: 'Eco‑friendly educational toys.', subcategory: 'toys' }
  ];
  for (const item of babyKidsItems) {
    products.push({
      name: item.name,
      category: 'baby_kids',
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      images: ['https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&auto=format&fit=crop'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&auto=format&fit=crop',
      brand: 'VR Retail',
      rating: 4.3, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: false,
      vrZone: 'furniture',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const petItems = [
    { name: 'Premium Dog Food', price: 39.99, description: 'Grain‑free kibble for adult dogs.', subcategory: 'dog' },
    { name: 'Cat Tower', price: 89.99, description: 'Multi‑level scratching tower.', subcategory: 'cat' }
  ];
  for (const item of petItems) {
    products.push({
      name: item.name,
      category: 'pets',
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      images: ['https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800&auto=format&fit=crop',
      brand: 'VR Retail',
      rating: 4.6, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: false,
      vrZone: 'furniture',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const nicheItems = [
    { name: 'Eco Bamboo Toothbrush', price: 3.99, description: 'Biodegradable toothbrush.', subcategory: 'eco' },
    { name: 'Indie Designer Hoodie', price: 79.99, description: 'Limited edition streetwear.', subcategory: 'indie' }
  ];
  for (const item of nicheItems) {
    products.push({
      name: item.name,
      category: 'niche',
      subcategory: item.subcategory,
      description: item.description,
      price: item.price,
      images: ['https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop',
      brand: 'VR Retail',
      rating: 4.0, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: false,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const accessoriesItems = [
    { name: 'Leather Belt', price: 39.99, description: 'Genuine leather belt, classic buckle.' },
    { name: 'Sunglasses', price: 79.99, description: 'Polarized lenses with UV protection.' }
  ];
  for (const item of accessoriesItems) {
    products.push({
      name: item.name,
      category: 'accessories',
      subcategory: 'unisex',
      description: item.description,
      price: item.price,
      images: images.accessories,
      thumbnailUrl: images.accessories[0],
      brand: 'VR Retail',
      rating: 4.1, reviewCount: Math.floor(Math.random() * 250) + 20,
      featured: Math.random() > 0.6,
      newArrival: Math.random() > 0.5,
      isAuthenticated: Math.random() > 0.5,
      vrZone: 'fashion',
      vrPosition: { x: Math.random() * 20 - 10, y: 0, z: Math.random() * 20 - 10 },
      isActive: true
    });
  }

  const countBefore = await Product.countDocuments();
  await Product.insertMany(products);
  const countAfter = await Product.countDocuments();
  console.log(`Inserted ${countAfter - countBefore} products. Total now: ${countAfter}`);

  await mongoose.disconnect();
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
