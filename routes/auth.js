// routes/auth.js

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware to verify JWT
const authController = require('../controllers/authController'); // Controller handling the logic




// Protected route to get user details
router.get('/user', authenticateToken, authController.getUserDetails);

// Route to update website preferences
router.put('/user/preferences', authenticateToken, authController.updateWebsitePreferences);

// Route to update user description
router.put('/user/description', authenticateToken, authController.updateUserDescription);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    [
        // Input Validation
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters long'),
        body('websitePreferences.theme')
            .optional()
            .isIn(['light', 'dark', 'custom'])
            .withMessage('Invalid theme option'),
        body('websitePreferences.layout')
            .optional()
            .isIn(['single-column', 'multi-column'])
            .withMessage('Invalid layout option'),
        // Add more validations as needed
    ],
    async (req, res) => {
        // Handle Validation Results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { email, password, websitePreferences } = req.body;

        try {
            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
            }

            // Create new user instance
            user = new User({
                email,
                password,
                websitePreferences,
            });

            // Save user to the database (password will be hashed via pre-save middleware)
            await user.save();

            // Generate JWT
            const payload = {
                id: user._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            });

            // Respond with user data and token
            res.status(201).json({
                message: 'User registered successfully',
                user: user.toJSON(), // Excludes password via toJSON method
                token,
            });
        } catch (error) {
            console.error('Registration Error:', error.message);
            res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    }
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
    '/login',
    [
        // Input Validation
        body('email')
            .isEmail()
            .withMessage('Please provide a valid email address')
            .normalizeEmail(),
        body('password')
            .exists()
            .withMessage('Password is required'),
    ],
    async (req, res) => {
        // Handle Validation Results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        const { email, password } = req.body;

        try {
            // Find user by email and include password field
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Compare passwords
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            // Generate JWT
            const payload = {
                id: user._id,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            });

            // Respond with user data and token
            res.status(200).json({
                message: 'Login successful',
                user: user.toJSON(), // Excludes password via toJSON method
                token,
            });
        } catch (error) {
            console.error('Login Error:', error.message);
            res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    }
);

module.exports = router;
