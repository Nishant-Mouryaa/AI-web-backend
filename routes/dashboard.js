// routes/dashboard.js

const express = require('express');
const router = express.Router();
const authenticateJWT = require('../middleware/auth');
const User = require('../models/User');
const Subscription = require('../models/Subscription'); // Assuming you have a Subscription model
const Revenue = require('../models/Revenue'); // Assuming you have a Revenue model

/**
 * @route   GET /api/dashboard/metrics
 * @desc    Get dashboard metrics
 * @access  Private
 */
router.get('/metrics', authenticateJWT, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
        const revenue = await Revenue.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const subscriptionGrowthPercentage = 5.4; // Example static value or calculate based on data
        const topRevenueSource = 'Online Ads'; // Example static value or determine dynamically

        res.status(200).json({
            totalUsers,
            activeSubscriptions,
            revenue: revenue[0]?.total || 0,
            subscriptionGrowthPercentage,
            topRevenueSource,
        });
    } catch (error) {
        console.error('Dashboard Metrics Fetch Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/dashboard/subscriptions
 * @desc    Get active subscriptions over time
 * @access  Private
 */
router.get('/subscriptions', authenticateJWT, async (req, res) => {
    try {
        // Example: Fetch monthly active subscriptions
        const subscriptionData = await Subscription.aggregate([
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    activeSubscriptions: { $sum: 1 },
                },
            },
            {
                $sort: { '_id': 1 },
            },
            {
                $project: {
                    month: '$_id',
                    activeSubscriptions: 1,
                    _id: 0,
                },
            },
        ]);

        res.status(200).json(subscriptionData);
    } catch (error) {
        console.error('Subscriptions Fetch Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/dashboard/revenue
 * @desc    Get revenue over time
 * @access  Private
 */
router.get('/revenue', authenticateJWT, async (req, res) => {
    try {
        // Example: Fetch monthly revenue
        const revenueData = await Revenue.aggregate([
            {
                $group: {
                    _id: { $month: '$date' },
                    revenue: { $sum: '$amount' },
                },
            },
            {
                $sort: { '_id': 1 },
            },
            {
                $project: {
                    month: '$_id',
                    revenue: 1,
                    _id: 0,
                },
            },
        ]);

        res.status(200).json(revenueData);
    } catch (error) {
        console.error('Revenue Fetch Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

/**
 * @route   GET /api/dashboard/revenue-source
 * @desc    Get revenue distribution by source
 * @access  Private
 */
router.get('/revenue-source', authenticateJWT, async (req, res) => {
    try {
        // Example: Fetch revenue by source
        const revenueBySource = await Revenue.aggregate([
            {
                $group: {
                    _id: '$source', // Assuming 'source' field exists in Revenue model
                    amount: { $sum: '$amount' },
                },
            },
            {
                $project: {
                    name: '$_id',
                    value: '$amount',
                    _id: 0,
                },
            },
        ]);

        res.status(200).json(revenueBySource);
    } catch (error) {
        console.error('Revenue by Source Fetch Error:', error.message);
        res.status(500).json({ message: 'Server Error' });
    }
});

// **Add this line to export the router**
module.exports = router;
