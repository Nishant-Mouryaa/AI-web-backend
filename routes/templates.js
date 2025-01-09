// routes/templates.js

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const authenticateJWT = require('../middleware/auth');
const Template = require('../models/Template');
const authenticateToken = require('../middleware/authenticateToken');
const templatesController = require('../controllers/templatesController'); // Import the controller


// Route: POST /api/templates/suggestions
router.post('/suggestions', authenticateToken, templatesController.getTemplateSuggestions);


/**
 * @route   POST /api/templates
 * @desc    Create and save a new website template
 * @access  Private
 */
router.post(
    '/',
    authenticateJWT,
    [
        // Input Validation
        body('name')
            .notEmpty()
            .withMessage('Template name is required')
            .trim()
            .escape(),
        body('style')
            .notEmpty()
            .withMessage('Template style is required')
            .isIn(['modern', 'classic', 'minimalist', 'vibrant', 'professional'])
            .withMessage('Invalid template style'),
        body('color')
            .notEmpty()
            .withMessage('Template color is required')
            .matches(/^#([0-9A-F]{3}){1,2}$/i)
            .withMessage('Please provide a valid HEX color code'),
        // Add more validations as needed
    ],
    async (req, res) => {
        // Handle Validation Results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, style, color } = req.body;

        try {
            // Create new template instance
            const newTemplate = new Template({
                name,
                style,
                color,
                createdBy: req.user.id, // Set by authenticateJWT middleware
            });

            // Save template to the database
            const savedTemplate = await newTemplate.save();

            res.status(201).json({
                message: 'Template created successfully',
                template: savedTemplate,
            });
        } catch (error) {
            console.error('Template Creation Error:', error.message);
            res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    }
);

/**
 * @route   GET /api/templates
 * @desc    Get all templates created by the authenticated user
 * @access  Private
 */
router.get('/', authenticateJWT, async (req, res) => {
    try {
        const templates = await Template.find({ createdBy: req.user.id });

        res.status(200).json({
            message: 'Templates fetched successfully',
            templates,
        });
    } catch (error) {
        console.error('Fetch Templates Error:', error.message);
        res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
});

/**
 * @route   GET /api/templates/:id
 * @desc    Get a specific template by ID
 * @access  Private
 */
router.get('/:id', authenticateJWT, async (req, res) => {
    try {
        const template = await Template.findOne({
            _id: req.params.id,
            createdBy: req.user.id,
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.status(200).json({
            message: 'Template fetched successfully',
            template,
        });
    } catch (error) {
        console.error('Fetch Template Error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Template ID' });
        }
        res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
});

/**
 * @route   PUT /api/templates/:id
 * @desc    Update a specific template by ID
 * @access  Private
 */
router.put(
    '/:id',
    authenticateJWT,
    [
        // Input Validation (optional fields)
        body('name')
            .optional()
            .notEmpty()
            .withMessage('Template name cannot be empty')
            .trim()
            .escape(),
        body('style')
            .optional()
            .isIn(['modern', 'classic', 'minimalist', 'vibrant', 'professional'])
            .withMessage('Invalid template style'),
        body('color')
            .optional()
            .matches(/^#([0-9A-F]{3}){1,2}$/i)
            .withMessage('Please provide a valid HEX color code'),
        // Add more validations as needed
    ],
    async (req, res) => {
        // Handle Validation Results
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, style, color } = req.body;

        // Build the update object
        const updateFields = {};
        if (name) updateFields.name = name;
        if (style) updateFields.style = style;
        if (color) updateFields.color = color;

        try {
            let template = await Template.findOne({
                _id: req.params.id,
                createdBy: req.user.id,
            });

            if (!template) {
                return res.status(404).json({ message: 'Template not found' });
            }

            // Update the template
            template = await Template.findByIdAndUpdate(
                req.params.id,
                { $set: updateFields },
                { new: true, runValidators: true }
            );

            res.status(200).json({
                message: 'Template updated successfully',
                template,
            });
        } catch (error) {
            console.error('Update Template Error:', error.message);
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ message: 'Invalid Template ID' });
            }
            res.status(500).json({ errors: [{ msg: 'Server Error' }] });
        }
    }
);

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete a specific template by ID
 * @access  Private
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
    try {
        const template = await Template.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id,
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found' });
        }

        res.status(200).json({ message: 'Template deleted successfully' });
    } catch (error) {
        console.error('Delete Template Error:', error.message);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid Template ID' });
        }
        res.status(500).json({ errors: [{ msg: 'Server Error' }] });
    }
});

module.exports = router;
 
