const mongoose = require('mongoose');

const cashbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    source: {
        type: String,
        enum: ['purchase', 'promotion', 'compensation', 'referral'],
        default: 'purchase'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    isUsed: {
        type: Boolean,
        default: false
    },
    usedAt: {
        type: Date,
        default: null
    },
    usedInOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    }
}, {
    timestamps: true
});

cashbackSchema.index({ user: 1, isUsed: 1, expiresAt: 1 });

module.exports = mongoose.model('Cashback', cashbackSchema);
