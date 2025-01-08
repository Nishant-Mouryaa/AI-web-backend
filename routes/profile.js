// routes/profile.js

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile
// @desc    Get authenticated user's profile
// @access  Private
router.get('/', authenticateJWT, async (req, res) => {
    try {
        // req.user.id was set in the authenticateJWT middleware
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Profile retrieval error:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
 
