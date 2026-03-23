const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Identify products with empty, null, or invalid image URLs
        const allProducts = await Product.find({ isActive: true });
        const toDeactivate = [];

        for (const p of allProducts) {
            const hasImageUrl = p.imageURL && p.imageURL.trim().length > 10;
            const hasImagesArray = p.images && p.images.length > 0 && p.images[0].trim().length > 10;
            
            if (!hasImageUrl && !hasImagesArray) {
                toDeactivate.push(p);
            }
        }

        console.log(`Found ${toDeactivate.length} active products without valid images.`);

        if (toDeactivate.length > 0) {
            for (const p of toDeactivate) {
                console.log(`- Removing: ${p.name} (ID: ${p._id})`);
            }
            
            const result = await Product.updateMany(
                { _id: { $in: toDeactivate.map(p => p._id) } },
                { isActive: false }
            );
            console.log(`Successfully deactivated ${result.modifiedCount} products.`);
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error('Cleanup error:', err);
    }
}

cleanup();
