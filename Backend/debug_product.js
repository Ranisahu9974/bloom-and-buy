const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function debug() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const p = await Product.findOne({ name: 'Verification Camera' });
        if (p) {
            console.log('--- PRODUCT FOUND ---');
            console.log('Name:', p.name);
            console.log('imageURL:', JSON.stringify(p.imageURL));
            console.log('images:', JSON.stringify(p.images));
            console.log('isActive:', p.isActive);
            console.log('approvalStatus:', p.approvalStatus);
        } else {
            console.log('Product not found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

debug();
