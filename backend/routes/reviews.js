const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validation');

const router = express.Router();

// GET /api/reviews/product/:productId - Get reviews for a product
router.get('/product/:productId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const reviews = await Review.find({ product: req.params.productId })
            .populate('user', 'name avatar membershipTier')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Review.countDocuments({ product: req.params.productId });

        // Rating distribution
        const ratingDist = await Review.aggregate([
            { $match: { product: require('mongoose').Types.ObjectId.createFromHexString(req.params.productId) } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            reviews,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
            ratingDistribution: ratingDist
        });
    } catch (error) {
        console.error('Reviews fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/reviews - Create review
router.post('/', auth, reviewValidation, async (req, res) => {
    try {
        const { productId, rating, comment, images } = req.body;

        // Check if already reviewed
        const existing = await Review.findOne({ user: req.userId, product: productId });
        if (existing) {
            return res.status(400).json({ error: 'You already reviewed this product' });
        }

        // Check verified purchase
        const hasPurchased = await Order.findOne({
            user: req.userId,
            'items.product': productId,
            status: 'Delivered'
        });

        // Compute trust level
        let trustLevel = 'Medium';
        if (hasPurchased) {
            trustLevel = 'High';
        } else {
            trustLevel = 'Low';
        }

        // Check reviewer's review history for variance (consistency check)
        const userReviews = await Review.find({ user: req.userId });
        if (userReviews.length >= 3) {
            const ratings = userReviews.map(r => r.rating);
            const mean = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            const variance = ratings.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / ratings.length;
            if (variance > 0.5 && hasPurchased) trustLevel = 'High';
        }

        // Spike detection: check if too many reviews in short period
        const recentReviewCount = await Review.countDocuments({
            product: productId,
            createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // last hour
        });

        if (recentReviewCount > 10) {
            trustLevel = 'Low'; // suspicious spike
        }

        const review = new Review({
            user: req.userId,
            product: productId,
            rating,
            comment,
            images: (images || []).slice(0, 3), // Max 3 images
            isVerifiedPurchase: !!hasPurchased,
            trustLevel
        });

        await review.save();

        // Update product average rating
        const allReviews = await Review.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(avgRating * 10) / 10,
            numReviews: allReviews.length
        });

        res.status(201).json({ message: 'Review submitted', review });
    } catch (error) {
        console.error('Review create error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'You already reviewed this product' });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
