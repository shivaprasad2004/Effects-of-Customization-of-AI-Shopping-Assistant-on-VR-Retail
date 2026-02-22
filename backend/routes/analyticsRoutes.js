const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const {
    getExperimentAnalytics, getUserAnalytics,
    exportCSV, exportPDFData, getLiveStats,
} = require('../controllers/analyticsController');

router.get('/experiment', authenticate, requireRole('researcher', 'admin'), getExperimentAnalytics);
router.get('/user/:userId', authenticate, getUserAnalytics);
router.get('/export/csv', authenticate, requireRole('researcher', 'admin'), exportCSV);
router.get('/export/pdf', authenticate, requireRole('researcher', 'admin'), exportPDFData);
router.get('/live', authenticate, requireRole('researcher', 'admin'), getLiveStats);

module.exports = router;
