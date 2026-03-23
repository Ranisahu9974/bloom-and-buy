const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const Cashback = require('../models/Cashback');
const Discount = require('../models/Discount');
const Notification = require('../models/Notification');
const Seller = require('../models/Seller');
const { auth } = require('../middleware/auth');
const { orderValidation } = require('../middleware/validation');

const router = express.Router();

// POST /api/orders/checkout - Place order
router.post('/checkout', auth, orderValidation, async (req, res) => {
    try {
        const { shippingAddress, paymentMethod = 'Credit Card', promoCode, useCashback } = req.body;

        // Get user cart
        const cart = await Cart.findOne({ user: req.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const user = await User.findById(req.userId);

        // Validate stock and build order items
        let subtotal = 0;
        const orderItems = [];

        for (const item of cart.items) {
            const product = item.product;
            if (!product || !product.isActive) {
                return res.status(400).json({ error: `Product ${product?.name || 'unknown'} is not available` });
            }
            if (product.stockQuantity < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                product: product._id,
                name: product.name,
                imageURL: product.imageURL,
                quantity: item.quantity,
                priceAtPurchase: product.price
            });
        }

        // Apply discount
        let discountAmount = 0;
        if (promoCode) {
            const discount = await Discount.findOne({ code: promoCode.toUpperCase() });
            if (discount && discount.isValid()) {
                if (discount.minOrderAmount && subtotal < discount.minOrderAmount) {
                    return res.status(400).json({ error: `Minimum order amount is ₹${discount.minOrderAmount}` });
                }


                if (discount.type === 'percentage') {
                    discountAmount = subtotal * (discount.value / 100);
                    if (discount.maxDiscount) {
                        discountAmount = Math.min(discountAmount, discount.maxDiscount);
                    }
                } else {
                    discountAmount = discount.value;
                }

                // Enforce margin floor globally
                let maxAllowedDiscount = 0;
                for (const item of cart.items) {
                    const minPrice = item.product.price * (discount.marginFloor || 0.5);
                    maxAllowedDiscount += Math.max(0, (item.product.price - minPrice) * item.quantity);
                }

                if (discountAmount > maxAllowedDiscount) {
                    discountAmount = maxAllowedDiscount;
                }

                discount.usedCount += 1;
                await discount.save();
            }
        }


        // Calculate shipping
        let shippingCost = subtotal > 4150 ? 0 : 50;

        // Calculate tax (8%)
        const taxableAmount = subtotal - discountAmount;
        const tax = Math.max(0, taxableAmount * 0.08);

        // Total
        const totalAmount = Math.max(0, subtotal - discountAmount + shippingCost + tax);

        // Calculate Delivery Time based on Seller vs Buyer Location
        let estimatedDays = 7; // Default for different state
        let sellerCity = 'Mumbai'; // Default fallback
        
        // Find the primary seller (using the first item for simplicity)
        if (cart.items[0]?.product?.seller) {
            const seller = await Seller.findById(cart.items[0].product.seller);
            if (seller && seller.address) {
                sellerCity = seller.address.city || 'Mumbai';
                const sellerState = (seller.address.state || '').toLowerCase();
                const buyerState = (shippingAddress.state || shippingAddress.region || '').toLowerCase();
                const sellerCityLower = (seller.address.city || '').toLowerCase();
                const buyerCityLower = (shippingAddress.city || '').toLowerCase();

                if (sellerCityLower === buyerCityLower) {
                    estimatedDays = 2; // Same city
                } else if (sellerState === buyerState) {
                    estimatedDays = 3; // Same state
                }
            }
        }

        const paymentStatus = (paymentMethod === 'Pay Later' || paymentMethod === 'Cash on Delivery') ? 'Pending' : 'Paid';

        // Create order
        const order = new Order({
            user: req.userId,
            items: orderItems,
            subtotal: Math.round(subtotal * 100) / 100,
            discountAmount: Math.round((discountAmount) * 100) / 100,
            cashbackUsed: 0,
            shippingCost: Math.round(shippingCost * 100) / 100,
            tax: Math.round(tax * 100) / 100,
            totalAmount: Math.round(totalAmount * 100) / 100,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            promoCode: promoCode || '',
            status: 'Confirmed',
            estimatedDelivery: new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000),
            estimatedDeliveryDays: estimatedDays,
            originCity: sellerCity,
            destinationCity: shippingAddress.city,
            isPayLater: paymentMethod === 'Pay Later'
        });

        await order.save();

        // Create seller notifications
        const sellerNotifications = new Map();
        for (const item of cart.items) {
            const product = item.product;
            if (product.seller) {
                const sellerId = product.seller.toString();
                if (!sellerNotifications.has(sellerId)) {
                    sellerNotifications.set(sellerId, {
                        items: [],
                        total: 0
                    });
                }
                const sellerData = sellerNotifications.get(sellerId);
                sellerData.items.push(`${product.name} (x${item.quantity})`);
                sellerData.total += product.price * item.quantity;
            }
        }

        for (const [sellerId, data] of sellerNotifications.entries()) {
            await Notification.create({
                recipient: sellerId,
                type: 'order',
                title: 'New Order Received!',
                message: `You have received an order for: ${data.items.join(', ')}`,
                data: {
                    orderId: order._id,
                    buyerName: user.name,
                    totalAmount: data.total
                }
            });
        }

        // Decrement stock
        for (const item of cart.items) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stockQuantity: -item.quantity, salesLastWeek: item.quantity, salesLast30Days: item.quantity }
            });
        }

        // Update user: total spent
        user.totalSpent += totalAmount;
        await user.save();


        // Clear cart
        cart.items = [];
        cart.promoCode = '';
        cart.useCashback = false;
        await cart.save();

        res.status(201).json({
            message: 'Order placed successfully!',
            order
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            error: 'Server error during checkout',
            message: error.message,
            details: error.errors ? Object.values(error.errors).map(e => e.message) : []
        });
    }
});


// GET /api/orders - List user orders
router.get('/', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments({ user: req.userId });

        res.json({
            orders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/orders/:id - Single order
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.userId })
            .populate('items.product', 'name imageURL category');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/orders/:id/track - Track order
router.get('/:id/track', auth, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.userId });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Compute delay info
        const statusSteps = ['Confirmed', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered'];
        const currentIndex = statusSteps.indexOf(order.status);

        // Check SLA
        const hoursSinceLastUpdate = order.statusHistory.length > 0
            ? (Date.now() - new Date(order.statusHistory[order.statusHistory.length - 1].timestamp)) / (1000 * 60 * 60)
            : 0;

        let delayInfo = null;
        if (hoursSinceLastUpdate > 48 && currentIndex < 5) {
            delayInfo = {
                isDelayed: true,
                hours: Math.round(hoursSinceLastUpdate),
                reason: order.delayReason || 'Processing delay'
            };
        }

        res.json({
            orderId: order._id,
            currentStatus: order.status,
            statusHistory: order.statusHistory,
            estimatedDelivery: order.estimatedDelivery,
            estimatedDeliveryDays: order.estimatedDeliveryDays,
            originCity: order.originCity,
            destinationCity: order.destinationCity,
            riskScore: order.riskScore,
            slaBreached: order.slaBreached,
            compensationApplied: order.compensationApplied,
            delayInfo,
            steps: statusSteps.map((step, i) => ({
                name: step,
                completed: i <= currentIndex,
                current: i === currentIndex
            }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
