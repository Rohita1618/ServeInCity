const express = require('express');
const router = express.Router();
const { forgotPassword, resetPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // For the settings page

// 1. Forgot Password Flow (Public - not logged in)
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 2. Change Password Flow (Protected - must be logged in)
router.put('/change-password', protect, changePassword);

module.exports = router;