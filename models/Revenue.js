 // models/Revenue.js

const mongoose = require('mongoose');

const RevenueSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // Add other fields as necessary
});

module.exports = mongoose.model('Revenue', RevenueSchema);
