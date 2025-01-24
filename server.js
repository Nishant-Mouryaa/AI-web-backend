// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Load environment variables
dotenv.config();
console.log('OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Loaded' : 'Missing');




// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile'); // Import the profile route
const dashboardRoutes = require('./routes/dashboard'); // Importing the dashboard route
const templatesRoutes = require('./routes/templates'); // Importing the templates route

// Initialize Express app
const app = express();



const path = require('path');

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(helmet()); // Secure HTTP headers
// CORS Configuration
app.use(cors({
    origin: 'https://ai-web-smoky.vercel.app', // Frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    credentials: true, // If you need to send cookies or authentication headers
  }));
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON payloads
app.use(mongoSanitize()); // Prevent NoSQL injection

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('🚀 Connected to MongoDB'))
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    });



   // Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        errors: [{ msg: 'Too many requests from this IP, please try again after 15 minutes' }],
    },
});

app.use('/api/', apiLimiter); // Apply rate limiting to all API routes
    

// Define Rate Limiting Rules
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: {
        errors: [{ msg: 'Too many login attempts from this IP, please try again after 15 minutes' }],
    },
});

// Apply to Auth Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);





// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes); // Use the profile route
app.use('/api/dashboard', dashboardRoutes); // Using the dashboard route
app.use('/api/templates', templatesRoutes); // Using the templates route

// Test Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'AI Builder Server is running!' });
});

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
