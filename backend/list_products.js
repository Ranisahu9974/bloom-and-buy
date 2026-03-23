const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function list() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const products = await Product.find({ isActive: true }).select('name imageURL images');
        for (const p of products) {
            console.log(`[${p.name}] imageURL: "${p.imageURL}", imageCount: ${p.images.length}`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

list();
