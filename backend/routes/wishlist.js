const express = require('express');
const Wishlist = require('../models/Wishlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/wishlist — Get user's wishlist
router.get('/', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.userId })
            .populate('products', 'name price basePrice imageURL category averageRating numReviews stockQuantity seller isClearance seasonalTag isNearExpiry');
        
        if (!wishlist) {
            wishlist = { products: [] };
        }

        // Filter out products with missing images
        const validProducts = (wishlist.products || []).filter(p => p && p.imageURL && p.imageURL.trim() !== '');

        res.json({ wishlist: { ...wishlist.toObject?.() || wishlist, products: validProducts } });
    } catch (error) {
        console.error('Wishlist fetch error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/wishlist/:productId — Add product to wishlist
router.post('/:productId', auth, async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.userId });
        
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.userId, products: [] });
        }

        if (wishlist.products.includes(req.params.productId)) {
            return res.status(400).json({ error: 'Product already in wishlist' });
        }

        wishlist.products.push(req.params.productId);
        await wishlist.save();

        res.status(201).json({ message: 'Added to wishlist', count: wishlist.products.length });
    } catch (error) {
        console.error('Wishlist add error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/wishlist/:productId — Remove product from wishlist
router.delete('/:productId', auth, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.userId });
        
        if (!wishlist) {
            return res.status(404).json({ error: 'Wishlist not found' });
        }

        wishlist.products = wishlist.products.filter(
            p => p.toString() !== req.params.productId
        );
        await wishlist.save();

        res.json({ message: 'Removed from wishlist', count: wishlist.products.length });
    } catch (error) {
        console.error('Wishlist remove error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
