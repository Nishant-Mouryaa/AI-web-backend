// middleware/auth.js

const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies the JWT sent in the Authorization header and attaches the user ID to the request object.
 */
const authenticateJWT = (req, res, next) => {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization header missing or malformed' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the user ID to the request object
        req.user = { id: decoded.id };

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = authenticateJWT;
 
