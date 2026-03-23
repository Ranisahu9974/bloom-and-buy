const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function removeImageless() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find products with missing or empty imageURL
        const result = await Product.updateMany(
            { 
                isActive: true, // Only deactivate currently active ones
                $or: [
                    { imageURL: '' },
                    { imageURL: null },
                    { imageURL: { $exists: false } }
                ]
            },
            { isActive: false }
        );

        console.log(`Deactivated ${result.modifiedCount} products without images.`);
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

removeImageless();
