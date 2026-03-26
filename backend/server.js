require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const discountRoutes = require('./routes/discounts');
const payLaterRoutes = require('./routes/paylater');
const adminRoutes = require('./routes/admin');
const sellerRoutes = require('./routes/seller');
const wishlistRoutes = require('./routes/wishlist');
const paymentRoutes = require('./routes/payment');
const emailRoutes = require('./routes/emails');

// Import cron jobs
const { initCronJobs } = require('./utils/cronJobs');

const app = express();

// Middleware
app.use(cors({
    origin: [
        process.env.FRONTEND_URL, 
        'http://localhost:5173', 
        'http://localhost:3000'
    ].filter(Boolean),
    credentials: true
}));
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Rate limiting settings
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per window
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/paylater', payLaterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/emails', emailRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;
let mongoUri = process.env.MONGODB_URI;

// Vercel Serverless: Connect Mongoose synchronously so it buffers requests
if (mongoUri && !mongoUri.includes('replace') && mongoUri !== '') {
    if (mongoose.connection.readyState === 0) {
        mongoose.connect(mongoUri)
            .then(() => console.log('✅ Connected to MongoDB Atlas'))
            .catch(err => console.error('❌ MongoDB connection error:', err));
    }
} else {
    console.error('❌ CRITICAL ERROR: No MONGODB_URI environment variable provided.');
}

// Start the server locally (Vercel uses module.exports)
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        try {
            initCronJobs();
        } catch (e) {
            console.log('Cron jobs skipped locally.');
        }
    });
}

// Export the Express API for Vercel Serverless Functions
module.exports = app;
