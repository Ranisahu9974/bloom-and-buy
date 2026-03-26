const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');


const router = express.Router();

let razorpay;
try {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keyId && keySecret && !keyId.includes('REPLACE_ME')) {
        razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
        console.log('✅ Razorpay initialized successfully');
    } else {
        console.log('⚠️ Razorpay is in Mock Mode - Missing credentials');
    }
} catch (err) {
    console.error('❌ Razorpay initialization error:', err.message);
}

// POST /api/payment/create-order
router.post('/create-order', auth, async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: {
                userId: req.userId.toString(),
            },
        };

        if (process.env.RAZORPAY_KEY_ID === 'rzp_test_REPLACE_ME' || !razorpay) {
            console.log('⚠️ Using Razorpay Mock Mode (no valid key provided or initialization failed)');
            return res.json({
                orderId: `mock_order_${Date.now()}`,
                amount: Math.round(amount * 100),
                currency,
                keyId: 'mock_test_key',
            });
        }

        const order = await razorpay.orders.create(options);
        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        console.error('Razorpay create order error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// POST /api/payment/verify
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (process.env.RAZORPAY_KEY_ID === 'rzp_test_REPLACE_ME') {
            return res.json({ verified: true, message: 'Mock Payment verified successfully' });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Invalid payment signature', verified: false });
        }

        res.json({ verified: true, message: 'Payment verified successfully' });
    } catch (error) {
        console.error('Razorpay verify error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
});

module.exports = router;
