const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { getCustomerProfile, getProductInsights, trackInteraction } = require('../controllers/crmController');

router.get('/customer-profile/:userId', authenticate, getCustomerProfile);
router.get('/insights/:productId', getProductInsights);
router.post('/track-interaction', authenticate, trackInteraction);

module.exports = router;
