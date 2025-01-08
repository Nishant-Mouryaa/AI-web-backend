// routes/api.js

const express = require('express');
const router = express.Router();

// Example Route
router.get('/status', (req, res) => {
    res.status(200).json({ status: 'API is working fine.' });
});

module.exports = router;
 
