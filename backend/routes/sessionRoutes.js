const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    startSession, endSession, submitSurvey,
    getSessionAnalytics, logProductView, recordPurchase,
} = require('../controllers/sessionController');

router.post('/start', authenticate, startSession);
router.put('/:id/end', authenticate, endSession);
router.post('/:id/survey', authenticate, submitSurvey);
router.get('/:id/analytics', authenticate, getSessionAnalytics);
router.post('/:id/product-view', authenticate, logProductView);
router.post('/:id/purchase', authenticate, recordPurchase);

module.exports = router;
