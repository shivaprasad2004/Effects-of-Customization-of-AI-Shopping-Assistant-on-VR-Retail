const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    getProfile, updateProfile, completeOnboarding, getUserSessions, deleteAccount,
} = require('../controllers/userController');

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/onboarding', authenticate, completeOnboarding);
router.get('/sessions', authenticate, getUserSessions);
router.delete('/account', authenticate, deleteAccount);

module.exports = router;
