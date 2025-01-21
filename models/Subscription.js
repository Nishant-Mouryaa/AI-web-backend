// models/Subscription.js

const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  plan: {
    type: String,
    required: true,
    enum: ['Basic', 'Pro', 'Enterprise'], // Example plans
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Add other fields as necessary
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
