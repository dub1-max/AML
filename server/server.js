const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const personRoutes = require('./routes/personRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const profileRoutes = require('./routes/profileRoutes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// API Routes
app.use('/api', authRoutes);
app.use('/api', personRoutes);
app.use('/api', trackingRoutes);
app.use('/api', onboardingRoutes);
app.use('/api', profileRoutes); // Add the profile routes

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; 