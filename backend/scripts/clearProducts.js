const mongoose = require('mongoose');
const Product = require('../models/Product');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Product.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} products.`);

        process.exit(0);
    } catch (err) {
        console.error('Error clearing products:', err);
        process.exit(1);
    }
}

clearProducts();
