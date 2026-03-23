const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [200, 'Name cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Automotive', 'Other'],
        index: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0.01, 'Price must be greater than 0']
    },
    basePrice: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0.01, 'Base price must be greater than 0']
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    seasonalTag: {
        type: String,
        enum: ['Spring', 'Summer', 'Fall', 'Winter', null],
        default: null
    },
    expiryDate: {
        type: Date,
        default: null
    },
    imageURL: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rejectionReason: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        default: ''
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isClearance: {
        type: Boolean,
        default: false
    },
    isNearExpiry: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    salesLastWeek: {
        type: Number,
        default: 0
    },
    salesLast30Days: {
        type: Number,
        default: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    tags: [{ type: String }],
    dynamicPriceMultiplier: {
        type: Number,
        default: 1.0,
        min: 0.5,
        max: 2.0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller',
        default: null
    }
}, {
    timestamps: true
});

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seasonalTag: 1 });

// Virtual: computed dynamic price
productSchema.virtual('dynamicPrice').get(function () {
    return Math.max(this.basePrice, this.price * this.dynamicPriceMultiplier);
});

// Check if product is expired
productSchema.methods.isExpired = function () {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
};

// Check near-expiry (within 7 days)
productSchema.methods.checkNearExpiry = function () {
    if (!this.expiryDate) return false;
    const daysUntilExpiry = (this.expiryDate - new Date()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

module.exports = mongoose.model('Product', productSchema);
