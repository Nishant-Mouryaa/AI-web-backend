// models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const UserSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please fill a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long'],
            select: false, // Exclude password field when querying
        },
        websitePreferences: {
            theme: {
                type: String,
                enum: ['light', 'dark', 'custom'],
                default: 'light',
            },
            layout: {
                type: String,
                enum: ['single-column', 'multi-column'],
                default: 'single-column',
            },
            // Add more preferences as needed
        },
    },
    {
        timestamps: true, // Automatically manage createdAt and updatedAt fields
    }
);

/**
 * Pre-save Middleware
 * Hashes the password before saving the user document if the password field is modified.
 */
UserSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password using the salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

/**
 * Instance Method: comparePassword
 * Compares a plaintext password with the hashed password stored in the database.
 * @param {string} candidatePassword - The plaintext password to compare.
 * @returns {Promise<boolean>} - Returns true if passwords match, else false.
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error(error);
    }
};

/**
 * Instance Method: toJSON
 * Customize the JSON representation of the user object to exclude sensitive information.
 */
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password; // Remove password field
    return userObject;
};

// Create and export the User model
const User = mongoose.model('User', UserSchema);

module.exports = User;
 
