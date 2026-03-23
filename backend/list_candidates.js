const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function listCandidates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const products = await Product.find({ isActive: true });
        
        console.log(`Total active products: ${products.length}`);
        
        const imageless = products.filter(p => !p.imageURL || p.imageURL.trim() === '' || p.imageURL.includes('placeholder'));
        
        console.log(`Potential products to remove: ${imageless.length}`);
        for (const p of imageless) {
            console.log(`- ${p.name} | URL: "${p.imageURL}"`);
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

listCandidates();
