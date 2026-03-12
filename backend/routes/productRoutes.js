const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
    getProducts, getProductById, getByCategory, createProduct, updateProduct,
    seedDemoProducts, seedShowcaseProducts, addReview, getShowcaseProducts,
    getConfiguratorOptions, getARData,
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/showcase', getShowcaseProducts);
router.get('/category/:cat', getByCategory);
router.get('/:id/configurator', getConfiguratorOptions);
router.get('/:id/ar-data', getARData);
router.get('/:id', getProductById);

// Authenticated routes
router.post('/:id/review', authenticate, addReview);

// Admin routes
router.post('/', authenticate, requireRole('admin'), createProduct);
router.put('/:id', authenticate, requireRole('admin'), updateProduct);
router.post('/admin/seed-demo', authenticate, requireRole('admin'), seedDemoProducts);
router.post('/admin/seed-showcase', authenticate, requireRole('admin'), seedShowcaseProducts);

module.exports = router;
