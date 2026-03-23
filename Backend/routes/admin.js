const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Discount = require('../models/Discount');
const Review = require('../models/Review');
const Cashback = require('../models/Cashback');
const Seller = require('../models/Seller');
const Notification = require('../models/Notification');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/summary - Dashboard summary
router.get('/summary', auth, admin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalSellers = await Seller.countDocuments();
        const activeSellers = await Seller.countDocuments({ isActive: true });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();

        // Revenue
        const revenueAgg = await Order.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
        ]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Revenue last 7 days
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: last7Days }, paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top selling products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } } } },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);


        // Low stock alerts
        const lowStock = await Product.find({
            isActive: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] }
        }).select('name stockQuantity lowStockThreshold category').limit(10);

        // Near-expiry products
        const nearExpiry = await Product.find({
            isActive: true,
            expiryDate: {
                $ne: null,
                $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                $gt: new Date()
            }
        }).select('name expiryDate category stockQuantity').limit(10);

        res.json({
            totalUsers,
            totalSellers,
            activeSellers,
            totalProducts,
            totalOrders,
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            ordersByStatus,
            recentRevenue,
            topProducts,
            lowStock,
            nearExpiry
        });
    } catch (error) {
        console.error('Admin summary error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ===== SELLER MANAGEMENT =====

// POST /api/admin/sellers - Create a seller account
router.post('/sellers', auth, admin, async (req, res) => {
    try {
        const { name, email, password, storeName, storeDescription, storeLogo, phone } = req.body;

        if (!name || !email || !password || !storeName || !phone) {
            return res.status(400).json({ error: 'Name, email, password, store name, and phone are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const user = new User({
            name,
            email,
            passwordHash: password,
            role: 'seller'
        });
        await user.save();

        const sellerProfile = new Seller({
            user: user._id,
            storeName,
            storeDescription: storeDescription || '',
            storeLogo: storeLogo || '',
            phone
        });
        await sellerProfile.save();

        res.status(201).json({
            message: 'Seller account created successfully',
            seller: sellerProfile,
            user: user.toJSON()
        });
    } catch (error) {
        console.error('Create seller error:', error);
        res.status(500).json({ error: 'Server error creating seller' });
    }
});

// GET /api/admin/sellers - List all sellers
router.get('/sellers', auth, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.active === 'true') query.isActive = true;
        if (req.query.active === 'false') query.isActive = false;
        if (req.query.search) {
            query.storeName = { $regex: req.query.search, $options: 'i' };
        }

        const sellers = await Seller.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Seller.countDocuments(query);

        const sellersWithStats = await Promise.all(sellers.map(async (s) => {
            const productCount = await Product.countDocuments({ seller: s._id, isActive: true });
            return { ...s.toObject(), productCount };
        }));

        res.json({
            sellers: sellersWithStats,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/sellers/:id - Get seller details
router.get('/sellers/:id', auth, admin, async (req, res) => {
    try {
        const sellerProfile = await Seller.findById(req.params.id).populate('user', 'name email createdAt');
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        const products = await Product.find({ seller: sellerProfile._id }).sort({ createdAt: -1 }).limit(20);
        const productCount = await Product.countDocuments({ seller: sellerProfile._id, isActive: true });

        res.json({ seller: sellerProfile, products, productCount });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/sellers/:id/toggle - Activate/deactivate a seller
router.put('/sellers/:id/toggle', auth, admin, async (req, res) => {
    try {
        const sellerProfile = await Seller.findById(req.params.id);
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller not found' });
        }

        sellerProfile.isActive = !sellerProfile.isActive;
        await sellerProfile.save();

        if (!sellerProfile.isActive) {
            await Product.updateMany({ seller: sellerProfile._id }, { isActive: false });
        } else {
            await Product.updateMany({ seller: sellerProfile._id }, { isActive: true });
        }

        res.json({
            message: `Seller ${sellerProfile.isActive ? 'activated' : 'deactivated'}`,
            seller: sellerProfile
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/admin/products/:id - Admin can remove any product
router.delete('/products/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deactivated by admin' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/products/moderation - Advanced filtering for products
router.get('/products/moderation', auth, admin, async (req, res) => {
    try {
        const { status, category, seller, search, page = 1, limit = 20 } = req.query;
        let query = {};
        
        if (status) query.approvalStatus = status;
        if (category) query.category = category;
        if (seller) query.seller = seller;
        if (search) {
            const rx = { $regex: search, $options: 'i' };
            query.$or = [{ name: rx }, { brand: rx }, { description: rx }];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const products = await Product.find(query)
            .populate('seller', 'storeName storeLogo user')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching moderation products' });
    }
});

// GET /api/admin/products/pending - Legacy support (kept but uses moderation route internally if needed)
router.get('/products/pending', auth, admin, async (req, res) => {
    try {
        const products = await Product.find({ approvalStatus: 'pending' })
            .populate('seller', 'storeName')
            .sort({ createdAt: -1 });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Server error fetch pending products' });
    }
});

// PUT /api/admin/products/:id/moderate - Approve or Reject product with Notification
router.put('/products/:id/moderate', auth, admin, async (req, res) => {
    try {
        const { approvalStatus, rejectionReason } = req.body;
        if (!['approved', 'rejected'].includes(approvalStatus)) {
            return res.status(400).json({ error: 'Invalid approval status' });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { approvalStatus, rejectionReason: rejectionReason || '' },
            { new: true }
        ).populate('seller');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Notify Seller
        if (product.seller && product.seller.user) {
            await new Notification({
                recipient: product.seller.user,
                role: 'seller',
                type: 'moderation',
                title: approvalStatus === 'approved' ? 'Product Approved! 🎉' : 'Product Rejected ❌',
                message: approvalStatus === 'approved' 
                    ? `Your product "${product.name}" has been approved and is now live.` 
                    : `Your product "${product.name}" was rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
                data: { productId: product._id, productName: product.name }
            }).save();
        }

        res.json({ message: `Product ${approvalStatus}`, product });
    } catch (error) {
        console.error('Moderation error:', error);
        res.status(500).json({ error: 'Server error moderating product' });
    }
});

// POST /api/admin/products/bulk-moderate - Bulk approve/reject
router.post('/products/bulk-moderate', auth, admin, async (req, res) => {
    try {
        const { productIds, approvalStatus } = req.body;
        if (!Array.isArray(productIds) || !['approved', 'rejected'].includes(approvalStatus)) {
            return res.status(400).json({ error: 'Invalid request' });
        }

        const products = await Product.updateMany(
            { _id: { $in: productIds } },
            { approvalStatus }
        );

        // Optional: Send notifications for each (skipped for bulk to avoid noise, or batch them)
        
        res.json({ message: `Bulk ${approvalStatus} successful`, modifiedCount: products.modifiedCount });
    } catch (error) {
        res.status(500).json({ error: 'Bulk moderation error' });
    }
});

// ===== EXISTING ADMIN ROUTES =====

// GET /api/admin/inventory
router.get('/inventory', auth, admin, async (req, res) => {
    try {
        const { deadstock, lowstock, category } = req.query;
        let query = { isActive: true };

        if (category) query.category = category;

        let products = await Product.find(query)
            .populate('seller', 'storeName')
            .sort({ stockQuantity: 1 })
            .limit(500);

        if (deadstock === 'true') {
            products = products.filter(p => p.salesLast30Days === 0 && p.stockQuantity > 10);
        }

        if (lowstock === 'true') {
            products = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
        }

        res.json({ products, total: products.length });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/orders
router.get('/orders', auth, admin, async (req, res) => {
    try {
        const { status, delay, page = 1, limit = 20 } = req.query;
        let query = {};

        if (status) query.status = status;
        if (delay === 'flagged') query.slaBreached = true;

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', auth, admin, async (req, res) => {
    try {
        const { status, note, location } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            location: location || '',
            note: note || `Status updated to ${status} by admin`
        });

        const hoursSinceOrder = (Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60);
        if (status !== 'Delivered' && status !== 'Cancelled' && hoursSinceOrder > 120) {
            order.slaBreached = true;
            if (!order.compensationApplied) {
                order.compensationApplied = '5% discount voucher for delayed delivery';
                await new Cashback({
                    user: order.user,
                    amount: order.totalAmount * 0.05,
                    source: 'compensation',
                    orderId: order._id,
                    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }).save();
            }
        }

        await order.save();
        res.json({ message: 'Order status updated', order });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/users
router.get('/users', auth, admin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const users = await User.find({ role: { $in: ['user', 'admin'] } })
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await User.countDocuments({ role: { $in: ['user', 'admin'] } });

        res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/discount-performance
router.get('/discount-performance', auth, admin, async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });

        const performance = await Promise.all(discounts.map(async (d) => {
            const ordersWithDiscount = await Order.countDocuments({ promoCode: d.code });
            const revenueWithDiscount = await Order.aggregate([
                { $match: { promoCode: d.code } },
                { $group: { _id: null, total: { $sum: '$totalAmount' }, avgOrder: { $avg: '$totalAmount' } } }
            ]);

            return {
                code: d.code,
                description: d.description,
                type: d.type,
                value: d.value,
                usedCount: d.usedCount,
                usageLimit: d.usageLimit,
                ordersGenerated: ordersWithDiscount,
                revenueGenerated: revenueWithDiscount[0]?.total || 0,
                avgOrderValue: Math.round((revenueWithDiscount[0]?.avgOrder || 0) * 100) / 100,
                isActive: d.isActive,
                startDate: d.startDate,
                endDate: d.endDate
            };
        }));

        res.json(performance);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/products/:id/override
router.put('/products/:id/override', auth, admin, async (req, res) => {
    try {
        const { price, stockQuantity, imageURL, isClearance } = req.body;
        const updates = {};

        if (price !== undefined) updates.price = price;
        if (stockQuantity !== undefined) updates.stockQuantity = stockQuantity;
        if (imageURL !== undefined) updates.imageURL = imageURL;
        if (isClearance !== undefined) updates.isClearance = isClearance;

        const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        res.json({
            message: 'Product override applied',
            product,
            overrideBy: req.user.name,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/flagged-reviews
router.get('/flagged-reviews', auth, admin, async (req, res) => {
    try {
        const reviews = await Review.find({ $or: [{ trustLevel: 'Low' }, { flagged: true }] })
            .populate('user', 'name email')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/admin/notifications - Get admin notifications
router.get('/notifications', auth, admin, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching notifications' });
    }
});

// PUT /api/admin/notifications/:id/read - Mark admin notification as read
router.put('/notifications/:id/read', auth, admin, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.userId },
            { isRead: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
