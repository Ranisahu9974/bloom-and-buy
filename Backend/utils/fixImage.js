require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Use reliable pexels.com CDN images that actually match each product
const imageFixMap = {
    // ELECTRONICS
    'Wireless Charging Pad': 'https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Smart LED Desk Lamp': 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    '4K Webcam with Ring Light': 'https://images.pexels.com/photos/4009402/pexels-photo-4009402.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'USB-C Hub 7-in-1': 'https://images.pexels.com/photos/4219862/pexels-photo-4219862.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // CLOTHING
    'Summer Linen Dress': 'https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Oversized Knit Sweater': 'https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Wool Blend Scarf': 'https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // HOME & KITCHEN
    'Bamboo Cutting Board Set': 'https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Aromatherapy Diffuser': 'https://images.pexels.com/photos/7260249/pexels-photo-7260249.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Electric Kettle Glass': 'https://images.pexels.com/photos/6316065/pexels-photo-6316065.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Cast Iron Skillet 12-inch': 'https://images.pexels.com/photos/4252137/pexels-photo-4252137.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // SPORTS
    'Jump Rope Speed Pro': 'https://images.pexels.com/photos/4162451/pexels-photo-4162451.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Resistance Bands Set': 'https://images.pexels.com/photos/4498606/pexels-photo-4498606.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Foam Roller Recovery': 'https://images.pexels.com/photos/4056535/pexels-photo-4056535.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Gym Duffel Bag': 'https://images.pexels.com/photos/3766111/pexels-photo-3766111.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Sports Compression Socks': 'https://images.pexels.com/photos/6740823/pexels-photo-6740823.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // BEAUTY
    'Vitamin C Brightening Serum': 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Jade Face Roller Set': 'https://images.pexels.com/photos/5938359/pexels-photo-5938359.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Electric Facial Cleansing Brush': 'https://images.pexels.com/photos/3997379/pexels-photo-3997379.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Nail Polish Set Pastel': 'https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // BOOKS
    'Vintage Leather Journal': 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Bestseller Fiction Collection': 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Children Picture Book Set': 'https://images.pexels.com/photos/256431/pexels-photo-256431.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // FOOD & GROCERY
    'Organic Honey Gift Box': 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Premium Mixed Nuts Pack': 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Protein Granola Bar Pack': 'https://images.pexels.com/photos/3872373/pexels-photo-3872373.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // TOYS
    'Plush Unicorn Large': 'https://images.pexels.com/photos/3662770/pexels-photo-3662770.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Remote Control Car': 'https://images.pexels.com/photos/97353/pexels-photo-97353.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Wooden Train Set': 'https://images.pexels.com/photos/163036/mario-luigi-yoshi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Play Dough Mega Set': 'https://images.pexels.com/photos/5063001/pexels-photo-5063001.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Outdoor Kite Dragon': 'https://images.pexels.com/photos/162360/kite-sport-wind-fly-162360.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',

    // AUTOMOTIVE
    'Car Phone Mount Pro': 'https://images.pexels.com/photos/13861/IMG_3496a.jpg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Dash Cam 1080p HD': 'https://images.pexels.com/photos/11592366/pexels-photo-11592366.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Car Vacuum Cleaner': 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'LED Interior Car Lights': 'https://images.pexels.com/photos/3849542/pexels-photo-3849542.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Tire Pressure Gauge Digital': 'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Car Air Freshener Set': 'https://images.pexels.com/photos/3849557/pexels-photo-3849557.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Steering Wheel Cover Leather': 'https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Car Trunk Organizer': 'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Emergency Car Kit': 'https://images.pexels.com/photos/5691659/pexels-photo-5691659.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
    'Windshield Sun Shade': 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&dpr=1',
};

async function fixAllImages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB\n');

        let fixed = 0;
        let failed = 0;

        for (const [name, newURL] of Object.entries(imageFixMap)) {
            const result = await Product.updateMany(
                { name: { $regex: new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } },
                { $set: { imageURL: newURL } }
            );
            if (result.modifiedCount > 0) {
                console.log(`✅ ${name}: updated`);
                fixed++;
            } else {
                console.log(`⚠️  ${name}: not found or already set`);
                failed++;
            }
        }

        console.log(`\n=== Summary ===`);
        console.log(`Fixed: ${fixed} | Skipped: ${failed}`);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

fixAllImages();
