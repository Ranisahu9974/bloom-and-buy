const express = require('express');
const Product = require('../models/Product');
const Seller = require('../models/Seller');
const { auth, admin, optionalAuth } = require('../middleware/auth');
const { productValidation } = require('../middleware/validation');

const router = express.Router();

// GET /api/products - List with filters, search, pagination
router.get('/', async (req, res) => {
    try {
        const {
            category, priceMin, priceMax, season, search,
            sort, page = 1, limit = 12, brand, clearance
        } = req.query;

        let query = { isActive: true, approvalStatus: 'approved', imageURL: { $exists: true, $not: /^\s*$/ } };

        // Category filter
        if (category) query.category = category;

        // Price range
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin) query.price.$gte = parseFloat(priceMin);
            if (priceMax) query.price.$lte = parseFloat(priceMax);
        }

        // Seasonal tag
        if (season) query.seasonalTag = season;

        // Brand
        if (brand) query.brand = { $regex: brand, $options: 'i' };

        // Clearance
        if (clearance === 'true') query.isClearance = true;

        // Text search — regex works without a text index
        const expiryFilter = [
            { expiryDate: null },
            { expiryDate: { $gt: new Date() } }
        ];

        if (search) {
            const rx = { $regex: search, $options: 'i' };
            const searchFilter = [
                { name: rx },
                { description: rx },
                { brand: rx },
                { category: rx }
            ];
            query.$and = [
                { $or: expiryFilter },
                { $or: searchFilter }
            ];
        } else {
            query.$or = expiryFilter;
        }

        // Sort options
        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'rating') sortOption = { averageRating: -1 };
        else if (sort === 'newest') sortOption = { createdAt: -1 };
        else if (sort === 'popular') sortOption = { salesLast30Days: -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(query)
            .populate('seller', 'storeName storeLogo')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.json({
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Products fetch error:', error);
        res.status(500).json({ error: 'Server error fetching products' });
    }
});

// GET /api/products/categories - Get all categories with counts
router.get('/categories', async (req, res) => {
    try {
        const categories = await Product.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/products/stats - Get platform statistics
router.get('/stats', async (req, res) => {
    try {
        const User = require('../models/User');
        const productsCount = await Product.countDocuments({ isActive: true });
        const customersCount = await User.countDocuments({ role: 'user' });
        
        const [reviewStats] = await Product.aggregate([
            { $match: { isActive: true, averageRating: { $gt: 0 } } },
            { $group: { _id: null, avg: { $avg: '$averageRating' } } }
        ]);
        
        const avgRating = reviewStats && reviewStats.avg ? reviewStats.avg.toFixed(1) : '4.8';
        
        const formatNumber = (num) => num >= 1000 ? (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+' : num.toString();

        res.json({
            products: formatNumber(productsCount),
            customers: formatNumber(customersCount),
            rating: avgRating + '★'
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/products/:id/related - Related products (same category)
router.get('/:id/related', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).select('category tags');
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const related = await Product.find({
            _id: { $ne: req.params.id },
            isActive: true,
            approvalStatus: 'approved',
            category: product.category,
        })
            .populate('seller', 'storeName')
            .limit(8)
            .sort({ averageRating: -1, salesLast30Days: -1 });

        res.json(related);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/products/:id - Single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'seller',
                select: 'storeName storeDescription storeLogo user',
                populate: { path: 'user', select: 'name' }
            });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/products - Admin create product
router.post('/', auth, admin, productValidation, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        console.error('Product create error:', error);
        res.status(500).json({ error: 'Server error creating product' });
    }
});

// PUT /api/products/:id - Admin update product
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product updated', product });
    } catch (error) {
        res.status(500).json({ error: 'Server error updating product' });
    }
});

// DELETE /api/products/:id - Admin soft-delete product
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
