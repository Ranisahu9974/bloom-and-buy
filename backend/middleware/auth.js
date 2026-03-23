const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ error: 'User not found.' });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token.' });
    }
};

// Admin middleware
const admin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Seller middleware
const seller = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Access denied. Seller only.' });
    }
    next();
};

// Admin or Seller middleware
const adminOrSeller = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'seller') {
        return res.status(403).json({ error: 'Access denied. Admin or Seller only.' });
    }
    next();
};

// Optional auth (user info if logged in, but not required)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
                req.userId = user._id;
            }
        }
    } catch (error) {
        // Silently continue without auth
    }
    next();
};

module.exports = { auth, admin, seller, adminOrSeller, optionalAuth };

