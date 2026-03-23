const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    imageURL: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    priceAtPurchase: {
        type: Number,
        required: true
    }
});

const statusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    location: String,
    note: String
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    subtotal: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
        default: 'Pending'
    },
    statusHistory: [statusHistorySchema],
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, default: 'US' }
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'Pay Later', 'Wallet', 'Razorpay', 'Cash on Delivery'],
        default: 'Razorpay'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    originCity: {
        type: String,
        default: ''
    },
    destinationCity: {
        type: String,
        default: ''
    },
    estimatedDeliveryDays: {
        type: Number,
        default: 5
    },
    promoCode: {
        type: String,
        default: ''
    },
    delayReason: {
        type: String,
        default: ''
    },
    riskScore: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    slaBreached: {
        type: Boolean,
        default: false
    },
    compensationApplied: {
        type: String,
        default: ''
    },
    estimatedDelivery: {
        type: Date
    },
    isPayLater: {
        type: Boolean,
        default: false
    },
    payLaterPlan: {
        installments: { type: Number, default: 0 },
        amountPerInstallment: { type: Number, default: 0 },
        paidInstallments: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

// Add initial status to history on creation
orderSchema.pre('save', function (next) {
    if (this.isNew) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
            note: 'Order placed'
        });
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
