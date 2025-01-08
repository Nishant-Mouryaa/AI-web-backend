// models/Template.js

const mongoose = require('mongoose');

// Define the Template Schema
const TemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Template name is required'],
            trim: true,
        },
        style: {
            type: String,
            required: [true, 'Template style is required'],
            enum: ['modern', 'classic', 'minimalist', 'vibrant', 'professional'], // Example styles
        },
        color: {
            type: String,
            required: [true, 'Template color is required'],
            match: [
                /^#([0-9A-F]{3}){1,2}$/i,
                'Please provide a valid HEX color code',
            ],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

// Create and export the Template model
const Template = mongoose.model('Template', TemplateSchema);

module.exports = Template;
 
