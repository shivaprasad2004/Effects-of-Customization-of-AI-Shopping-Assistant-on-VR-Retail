const express = require('express');
const router = express.Router();
const { getKioskData, getDisplayCatalog } = require('../controllers/displayController');

router.get('/kiosk/:productId', getKioskData);
router.get('/catalog/:category', getDisplayCatalog);

module.exports = router;
