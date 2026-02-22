const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
    getProducts, getProductById, getByCategory, createProduct, updateProduct, seedDemoProducts,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/category/:cat', getByCategory);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('admin'), createProduct);
router.put('/:id', authenticate, requireRole('admin'), updateProduct);
router.post('/admin/seed-demo', authenticate, requireRole('admin'), seedDemoProducts);

module.exports = router;
