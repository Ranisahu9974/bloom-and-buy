const { validationResult, body, query, param } = require('express-validator');

// Validation error handler
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Registration validation
const registerValidation = [
    body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain a number'),
    body('phone').trim().matches(/^\+[1-9]\d{9,14}$/).withMessage('Valid international phone number required (e.g. +919876543210)'),
    body('role').optional().isIn(['user', 'seller']).withMessage('Invalid role'),
    body('storeName').if(body('role').equals('seller')).trim().notEmpty().withMessage('Store name is required for sellers'),
    validate
];

// Login validation
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

// Product validation
const productValidation = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
    body('basePrice').isFloat({ min: 0.01 }).withMessage('Base price must be greater than 0'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    validate
];

// Order validation
const orderValidation = [
    body('shippingAddress.street').notEmpty().withMessage('Street is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    validate
];

// Review validation
const reviewValidation = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').trim().isLength({ min: 5, max: 1000 }).withMessage('Comment must be 5-1000 characters'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    productValidation,
    orderValidation,
    reviewValidation
};
