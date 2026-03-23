const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/cart - Get user's cart
router.get('/', auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.userId })
            .populate('items.product', 'name price imageURL stockQuantity category');

        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
            await cart.save();
        }

        // Calculate totals
        let subtotal = 0;
        const validItems = [];
        for (const item of cart.items) {
            if (item.product) {
                subtotal += item.product.price * item.quantity;
                validItems.push(item);
            }
        }

        res.json({
            cart: {
                ...cart.toObject(),
                items: validItems
            },
            subtotal: Math.round(subtotal * 100) / 100,
            itemCount: validItems.reduce((sum, i) => sum + i.quantity, 0)
        });
    } catch (error) {
        console.error('Cart fetch error:', error);
        res.status(500).json({ error: 'Server error fetching cart' });
    }
});

// POST /api/cart/add - Add item to cart
router.post('/add', auth, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product exists and has stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        if (!product.isActive) {
            return res.status(400).json({ error: 'Product is not available' });
        }
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        let cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            cart = new Cart({ user: req.userId, items: [] });
        }

        // Check if product already in cart
        const existingItem = cart.items.find(
            item => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += quantity;
            if (existingItem.quantity > product.stockQuantity) {
                return res.status(400).json({ error: 'Not enough stock for requested quantity' });
            }
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        await cart.populate('items.product', 'name price imageURL stockQuantity');

        res.json({ message: 'Item added to cart', cart });
    } catch (error) {
        console.error('Cart add error:', error);
        res.status(500).json({ error: 'Server error adding to cart' });
    }
});

// PUT /api/cart/update - Update cart item quantity
router.put('/update', auth, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const product = await Product.findById(productId);
        if (!product || product.stockQuantity < quantity) {
            return res.status(400).json({ error: 'Insufficient stock' });
        }

        const cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        const item = cart.items.find(i => i.product.toString() === productId);
        if (!item) {
            return res.status(404).json({ error: 'Item not in cart' });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.product', 'name price imageURL stockQuantity');

        res.json({ message: 'Cart updated', cart });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating cart' });
    }
});

// DELETE /api/cart/remove - Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== req.params.productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price imageURL stockQuantity');

        res.json({ message: 'Item removed', cart });
    } catch (error) {
        res.status(500).json({ error: 'Server error removing from cart' });
    }
});

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', auth, async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { user: req.userId },
            { items: [], promoCode: '', useCashback: false }
        );
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Server error clearing cart' });
    }
});

module.exports = router;
