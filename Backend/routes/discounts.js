const express = require('express');
const Discount = require('../models/Discount');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// POST /api/discounts - Admin create discount
router.post('/', auth, admin, async (req, res) => {
    try {
        const discount = new Discount(req.body);
        await discount.save();
        res.status(201).json({ message: 'Discount created', discount });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Discount code already exists' });
        }
        res.status(500).json({ error: 'Server error creating discount' });
    }
});

// GET /api/discounts - Admin list all discounts
router.get('/', auth, admin, async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/discounts/validate - Validate a promo code
router.post('/validate', auth, async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        const discount = await Discount.findOne({ code: code.toUpperCase() });

        if (!discount) {
            return res.status(404).json({ error: 'Invalid promo code' });
        }

        if (!discount.isValid()) {
            return res.status(400).json({ error: 'This promo code has expired or reached its usage limit' });
        }

        if (discount.minOrderAmount > 0 && subtotal < discount.minOrderAmount) {
            return res.status(400).json({ error: `Minimum order amount is ₹${discount.minOrderAmount}` });
        }

        // Check tier eligibility
        const user = req.user;
        if (discount.applicableTiers.length > 0 && !discount.applicableTiers.includes(user.membershipTier)) {
            return res.status(400).json({ error: 'This discount is not available for your membership tier' });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (discount.type === 'percentage') {
            discountAmount = subtotal * (discount.value / 100);
            if (discount.maxDiscount) {
                discountAmount = Math.min(discountAmount, discount.maxDiscount);
            }
        } else {
            discountAmount = Math.min(discount.value, subtotal);
        }

        res.json({
            valid: true,
            discount: {
                code: discount.code,
                description: discount.description,
                type: discount.type,
                value: discount.value,
                discountAmount: Math.round(discountAmount * 100) / 100,
                newTotal: Math.round((subtotal - discountAmount) * 100) / 100
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error validating discount' });
    }
});

// PUT /api/discounts/:id - Admin update discount
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!discount) return res.status(404).json({ error: 'Discount not found' });
        res.json({ message: 'Discount updated', discount });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/discounts/:id - Admin delete discount
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        await Discount.findByIdAndDelete(req.params.id);
        res.json({ message: 'Discount deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
