const express = require('express');
const Seller = require('../models/Seller');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const { auth, seller } = require('../middleware/auth');

const router = express.Router();

// GET /api/seller/dashboard - Seller dashboard summary
router.get('/dashboard', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const totalProducts = await Product.countDocuments({ seller: sellerProfile._id, isActive: true });
        const outOfStock = await Product.countDocuments({ seller: sellerProfile._id, isActive: true, stockQuantity: 0 });
        const lowStock = await Product.countDocuments({
            seller: sellerProfile._id,
            isActive: true,
            $expr: { $lte: ['$stockQuantity', '$lowStockThreshold'] },
            stockQuantity: { $gt: 0 }
        });

        // Get orders containing seller's products
        const sellerProducts = await Product.find({ seller: sellerProfile._id }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        const orderStats = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds } } },
            {
                $group: {
                    _id: null,
                    totalOrders: { $addToSet: '$_id' },
                    totalRevenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
                    totalItemsSold: { $sum: '$items.quantity' }
                }
            }
        ]);

        const stats = orderStats[0] || { totalOrders: [], totalRevenue: 0, totalItemsSold: 0 };

        // Recent orders for seller's products
        const recentOrders = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
                $project: {
                    _id: 1,
                    status: 1,
                    createdAt: 1,
                    itemName: '$items.name',
                    itemQuantity: '$items.quantity',
                    itemPrice: '$items.priceAtPurchase',
                    itemImage: '$items.imageURL'
                }
            }
        ]);

        res.json({
            seller: sellerProfile,
            stats: {
                totalProducts,
                outOfStock,
                lowStock,
                totalOrders: stats.totalOrders?.length || 0,
                totalRevenue: Math.round(stats.totalRevenue * 100) / 100,
                totalItemsSold: stats.totalItemsSold
            },
            recentOrders
        });
    } catch (error) {
        console.error('Seller dashboard error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/seller/analytics - Seller dashboard charts data
router.get('/analytics', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) return res.status(404).json({ error: 'Seller profile not found' });

        const sellerProducts = await Product.find({ seller: sellerProfile._id }).select('_id name');
        const productIds = sellerProducts.map(p => p._id);
        const productMap = sellerProducts.reduce((acc, p) => { acc[p._id.toString()] = p.name; return acc; }, {});

        // Get orders from last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const orders = await Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds } } },
            { 
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
                    sales: { $sum: '$items.quantity' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top products
        const topProducts = await Order.aggregate([
            { $unwind: '$items' },
            { $match: { 'items.product': { $in: productIds } } },
            { 
                $group: {
                    _id: '$items.product',
                    revenue: { $sum: { $multiply: ['$items.priceAtPurchase', '$items.quantity'] } },
                    sales: { $sum: '$items.quantity' }
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 }
        ]);

        const topProductsData = topProducts.map(tp => ({
            name: productMap[tp._id.toString()] || 'Unknown Product',
            revenue: tp.revenue,
            sales: tp.sales
        }));

        res.json({
            salesTimeline: orders,
            topProducts: topProductsData
        });
    } catch (error) {
        console.error('Seller analytics error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/seller/profile - Get seller profile
router.get('/profile', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }
        res.json(sellerProfile);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/seller/profile - Update seller profile
router.put('/profile', auth, seller, async (req, res) => {
    try {
        const { storeName, storeDescription, storeLogo, phone } = req.body;
        const updates = {};
        if (storeName !== undefined) updates.storeName = storeName;
        if (storeDescription !== undefined) updates.storeDescription = storeDescription;
        if (storeLogo !== undefined) updates.storeLogo = storeLogo;
        if (phone !== undefined) updates.phone = phone;

        const sellerProfile = await Seller.findOneAndUpdate(
            { user: req.userId },
            updates,
            { new: true }
        );

        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        res.json({ message: 'Profile updated', seller: sellerProfile });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/seller/products - List seller's products
router.get('/products', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = { seller: sellerProfile._id };

        // Optional filters
        if (req.query.category) query.category = req.query.category;
        if (req.query.active === 'true') query.isActive = true;
        if (req.query.active === 'false') query.isActive = false;
        if (req.query.search) {
            const rx = { $regex: req.query.search, $options: 'i' };
            query.$or = [{ name: rx }, { description: rx }];
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: {
                page, limit, total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/seller/products - Seller add product
router.post('/products', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }
        if (!sellerProfile.isActive) {
            return res.status(403).json({ error: 'Your seller account is deactivated. Contact admin.' });
        }

        const { name, description, category, price, basePrice, stockQuantity, imageURL, brand, tags, seasonalTag, expiryDate } = req.body;

        if (!name || !description || !category || !price || !basePrice) {
            return res.status(400).json({ error: 'Name, description, category, price, and base price are required' });
        }

        const product = new Product({
            name,
            description,
            category,
            price,
            basePrice,
            stockQuantity: stockQuantity || 0,
            imageURL: imageURL || '',
            brand: brand || '',
            tags: tags || [],
            seasonalTag: seasonalTag || null,
            expiryDate: expiryDate || null,
            seller: sellerProfile._id
        });

        await product.save();

        // Notify Admins
        const admins = await User.find({ role: 'admin' }).select('_id');
        const adminNotifications = admins.map(admin => ({
            recipient: admin._id,
            role: 'admin',
            type: 'moderation',
            title: 'New Product Submission 📦',
            message: `Seller "${sellerProfile.storeName}" has submitted a new product: "${product.name}".`,
            data: { productId: product._id, productName: product.name, sellerId: sellerProfile._id }
        }));
        if (adminNotifications.length > 0) {
            await Notification.insertMany(adminNotifications);
        }

        // Update seller product count
        await Seller.findByIdAndUpdate(sellerProfile._id, { $inc: { totalProducts: 1 } });

        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        console.error('Seller product create error:', error);
        res.status(500).json({ error: 'Server error creating product' });
    }
});

// PUT /api/seller/products/:id - Seller update own product
router.put('/products/:id', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check ownership
        if (!product.seller || product.seller.toString() !== sellerProfile._id.toString()) {
            return res.status(403).json({ error: 'You can only edit your own products' });
        }

        const allowedFields = ['name', 'description', 'category', 'price', 'basePrice', 'stockQuantity', 'imageURL', 'brand', 'tags', 'seasonalTag', 'expiryDate', 'isActive'];
        const updates = {};
        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
        res.json({ message: 'Product updated', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating product' });
    }
});

// DELETE /api/seller/products/:id - Seller soft-delete own product
router.delete('/products/:id', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check ownership
        if (!product.seller || product.seller.toString() !== sellerProfile._id.toString()) {
            return res.status(403).json({ error: 'You can only delete your own products' });
        }

        product.isActive = false;
        await product.save();

        // Update seller product count
        await Seller.findByIdAndUpdate(sellerProfile._id, { $inc: { totalProducts: -1 } });

        res.json({ message: 'Product deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/seller/orders - Get orders for seller's products
router.get('/orders', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const sellerProducts = await Product.find({ seller: sellerProfile._id }).select('_id');
        const productIds = sellerProducts.map(p => p._id);

        const orders = await Order.find({ 'items.product': { $in: productIds } })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Order.countDocuments({ 'items.product': { $in: productIds } });

        // Filter order items to only show seller's products
        const filteredOrders = orders.map(order => {
            const orderObj = order.toObject();
            orderObj.items = orderObj.items.filter(item =>
                productIds.some(pid => pid.toString() === item.product?.toString())
            );
            return orderObj;
        });

        res.json({
            orders: filteredOrders,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});


// GET /api/seller/notifications - Get seller notifications
router.get('/notifications', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const notifications = await Notification.find({ recipient: sellerProfile._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/seller/notifications/:id/read - Mark notification as read
router.put('/notifications/:id/read', auth, seller, async (req, res) => {
    try {
        const sellerProfile = await Seller.findOne({ user: req.userId });
        if (!sellerProfile) {
            return res.status(404).json({ error: 'Seller profile not found' });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: sellerProfile._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
