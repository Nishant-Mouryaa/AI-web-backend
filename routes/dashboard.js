// routes/dashboard.js

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');

/**
 * @route   GET /api/dashboard
 * @desc    Get authenticated user's dashboard data
 * @access  Private
 */
router.get('/', authenticateJWT, async (req, res) => {
    try {
        // req.user.id was set in the authenticateJWT middleware
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Dashboard data fetched successfully',
            user: {
                email: user.email,
                websitePreferences: user.websitePreferences,
                createdAt: user.createdAt,
                // Add more user details as needed
            },
        });
    } catch (error) {
        console.error('Dashboard Fetch Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
 
