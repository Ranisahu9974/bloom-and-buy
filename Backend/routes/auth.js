const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Order = require('../models/Order');
const Seller = require('../models/Seller');
const { auth } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');
const { sendLoginEmail } = require('../utils/mailer');


const router = express.Router();

// POST /api/register - Sign up
router.post('/register', registerValidation, async (req, res) => {
    try {
        const { name, email, password, phone, role = 'user', storeName, storeLogo } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const user = new User({ 
            name, 
            email, 
            passwordHash: password, 
            phone,
            role: ['user', 'seller'].includes(role) ? role : 'user'
        });
        await user.save();

        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.create({
                user: user._id,
                storeName: storeName || `${name}'s Store`,
                storeLogo: storeLogo || '',
                phone: phone || ''
            });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: user.toJSON(),
            sellerProfile
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// POST /api/login
router.post('/login', loginValidation, async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.findOne({ user: user._id })
                .select('storeName storeDescription storeLogo phone isActive');
        }

        // Send login success email (non-blocking)
        sendLoginEmail(user.email, user.name);

        res.json({
            message: 'Login successful',
            token,
            user: user.toJSON(),
            sellerProfile
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// POST /api/auth/google - Google OAuth (Firebase ID token)
router.post('/auth/google', async (req, res) => {
    try {
        const { idToken, name, email, avatar } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required for Google login' });
        }

        // Upsert user by email (create if not exists)
        let user = await User.findOne({ email });
        const isNewUser = !user;

        if (!user) {
            user = new User({
                name: name || email.split('@')[0],
                email,
                passwordHash: `google_${Date.now()}_${Math.random()}`, // placeholder — will be hashed but never used
                avatar: avatar || '',
                googleId: idToken || 'google',
            });
            await user.save();
        } else {
            // Update avatar / name if changed
            if (avatar && avatar !== user.avatar) user.avatar = avatar;
            if (name && name !== user.name) user.name = name;
            await user.save();
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.findOne({ user: user._id })
                .select('storeName storeDescription storeLogo phone isActive');
        }

        // Always send login email
        sendLoginEmail(user.email, user.name);

        res.json({
            message: 'Google login successful',
            token,
            user: user.toJSON(),
            sellerProfile,
            isNewUser,
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ error: 'Google authentication failed' });
    }
});



// GET /api/users/me - Get profile
router.get('/users/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        let sellerProfile = null;
        if (user.role === 'seller') {
            sellerProfile = await Seller.findOne({ user: user._id })
                .select('storeName storeDescription storeLogo phone isActive');
        }
        res.json({ user: user.toJSON(), sellerProfile });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/users/me - Update profile
router.put('/users/me', auth, async (req, res) => {
    try {
        const updates = {};
        const allowedFields = ['name', 'phone', 'address', 'avatar'];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
        res.json({ message: 'Profile updated', user: user.toJSON() });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/me/orders - Order history
router.get('/users/me/orders', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('items.product', 'name imageURL');

        const total = await Order.countDocuments({ user: req.userId });

        res.json({
            orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
