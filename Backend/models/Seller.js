const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    storeName: {
        type: String,
        required: [true, 'Store name is required'],
        trim: true,
        maxlength: [100, 'Store name cannot exceed 100 characters']
    },
    storeDescription: {
        type: String,
        default: '',
        maxlength: [1000, 'Store description cannot exceed 1000 characters']
    },
    storeLogo: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    address: {
        city: { type: String, default: 'Mumbai' },
        state: { type: String, default: 'Maharashtra' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: 'India' }
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Seller', sellerSchema);

