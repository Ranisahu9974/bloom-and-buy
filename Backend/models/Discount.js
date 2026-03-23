const mongoose = require('mongoose');

const discountSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscount: {
        type: Number,
        default: null // max cap for percentage discounts
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    applicableCategories: [{
        type: String
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    usageLimitPerUser: {
        type: Number,
        default: 1
    },
    isActive: {
        type: Boolean,
        default: true
    },
    stackable: {
        type: Boolean,
        default: false
    },
    marginFloor: {
        type: Number,
        default: 1.0 // multiplier for base price
    },
    priority: {
        type: Number,
        default: 0 // higher priority discount applied first
    }
}, {
    timestamps: true
});

// Check if discount is valid
discountSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive &&
        now >= this.startDate &&
        now <= this.endDate &&
        (this.usageLimit === null || this.usedCount < this.usageLimit);
};

module.exports = mongoose.model('Discount', discountSchema);
