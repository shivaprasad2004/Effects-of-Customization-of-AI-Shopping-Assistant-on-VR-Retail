const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getTrending, getSimilar, getPersonalized } = require('../controllers/recommendController');

router.get('/trending', getTrending);
router.get('/similar/:productId', getSimilar);
router.post('/', authenticate, getPersonalized);

module.exports = router;
