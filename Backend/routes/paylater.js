const express = require('express');
const User = require('../models/User');
const Order = require('../models/Order');
const PayLater = require('../models/PayLater');
const { auth } = require('../middleware/auth');

const router = express.Router();

// POST /api/paylater/check-eligibility - Check if user is eligible
router.post('/check-eligibility', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.userId);

        const reasons = [];
        let eligible = true;

        // Rule 2: Amount limit
        if (amount > 166000) {
            eligible = false;
            reasons.push(`Maximum Pay Later amount is ₹1,66,000`);
        }

        // Rule 4: Minimum order history (at least 3 orders)
        const orderCount = await Order.countDocuments({ user: req.userId, status: 'Delivered' });
        if (orderCount < 3) {
            eligible = false;
            reasons.push('Minimum 3 completed orders required');
        }

        // Rule 5: No existing defaulted pay-later
        const defaulted = await PayLater.findOne({ user: req.userId, status: 'Defaulted' });
        if (defaulted) {
            eligible = false;
            reasons.push('Outstanding defaulted Pay Later plan exists');
        }

        // Rule 6: Max active pay-later plans
        const activePlans = await PayLater.countDocuments({ user: req.userId, status: 'Active' });
        if (activePlans >= 3) {
            eligible = false;
            reasons.push('Maximum 3 active Pay Later plans allowed');
        }

        // Calculate installments if eligible
        let plan = null;
        if (eligible) {
            const installments = 3;
            plan = {
                installments,
                amountPerInstallment: Math.round((amount / installments) * 100) / 100,
                totalAmount: amount,
                schedule: Array.from({ length: installments }, (_, i) => ({
                    installment: i + 1,
                    dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000),
                    amount: Math.round((amount / installments) * 100) / 100
                }))
            };
        }

        res.json({
            eligible,
            reasons: eligible ? [] : reasons,
            plan,
            alternatives: !eligible ? ['Credit Card', 'Debit Card', 'Wallet Balance'] : []
        });
    } catch (error) {
        console.error('Eligibility check error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/paylater/plans - Get user's pay-later plans
router.get('/plans', auth, async (req, res) => {
    try {
        const plans = await PayLater.find({ user: req.userId })
            .populate('order', 'items totalAmount createdAt')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
