// routes/auth.js

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authenticateToken'); // Middleware to verify JWT
const authController = require('../controllers/authController'); // Controller handling the logic
const multer = require('multer');



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


// Configure Multer for avatar uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/avatars'); // Ensure this directory exists
    },
    filename: function (req, file, cb) {
      // Use the user ID and current timestamp for unique filenames
      cb(null, req.user.id + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  // File filter to accept only images
  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
  
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed (jpeg, jpg, png, gif)'));
    }
  };
  
  const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
    fileFilter: fileFilter,
  });
  
  /**
   * @route   PUT /api/auth/user/profile
   * @desc    Update user profile
   * @access  Private
   */
  router.put('/user/profile', authenticateToken , upload.single('avatar'), async (req, res) => {
    try {
      const { name } = req.body;
      let avatar;
  
      if (req.file) {
        // If a new avatar is uploaded, set the avatar URL/path
        avatar = `/uploads/avatars/${req.file.filename}`;
      }
  
      // Find the user and update
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          name: name || req.user.name,
          ...(avatar && { avatar }),
        },
        { new: true, select: '-password' }
      );
  
      res.status(200).json({
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        // Include other updated fields if necessary
      });
    } catch (error) {
      console.error('Profile Update Error:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  
  /**
   * @route   PUT /api/auth/user/change-password
   * @desc    Change user password
   * @access  Private
   */
  router.put('/user/change-password', authenticateToken, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
  
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
      }
  
      // Find the user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      // Compare current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect.' });
      }
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      // Update the password
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password updated successfully.' });
    } catch (error) {
      console.error('Password Change Error:', error.message);
      res.status(500).json({ message: 'Server Error' });
    }
  });
  

module.exports = router;
