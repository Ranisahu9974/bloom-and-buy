const mongoose = require('mongoose');

const payLaterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    denialReason: {
        type: String,
        default: ''
    },
    installments: {
        type: Number,
        default: 3
    },
    amountPerInstallment: {
        type: Number,
        default: 0
    },
    paidInstallments: {
        type: Number,
        default: 0
    },
    nextPaymentDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Pending', 'Active', 'Completed', 'Defaulted'],
        default: 'Pending'
    },
    paymentHistory: [{
        amount: Number,
        paidAt: Date,
        installmentNumber: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('PayLater', payLaterSchema);
