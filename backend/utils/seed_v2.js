/**
 * Bloom&Buy - Comprehensive Seed Script v2
 * 6 sellers, 6+ products each, all categories covered
 * Run: node utils/seed_v2.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloomandbuy';

const sellers = [
    {
        user: { name: 'TechZone India', email: 'techzone@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'TechZone India',
            storeDescription: 'Premium electronics and gadgets at unbeatable prices.',
            storeLogo: 'https://img.icons8.com/color/96/computer.png',
            phone: '9812345670',
            address: { city: 'Mumbai', state: 'Maharashtra', zipCode: '400001', country: 'India' }
        }
    },
    {
        user: { name: 'StyleKart', email: 'stylekart@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'StyleKart Fashion',
            storeDescription: 'Trendy fashion for every occasion.',
            storeLogo: 'https://img.icons8.com/color/96/shopping-bag.png',
            phone: '9812345671',
            address: { city: 'New Delhi', state: 'Delhi', zipCode: '110001', country: 'India' }
        }
    },
    {
        user: { name: 'HomeNest', email: 'homenest@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'HomeNest Decor',
            storeDescription: 'Beautiful home essentials and kitchen gear.',
            storeLogo: 'https://img.icons8.com/color/96/home.png',
            phone: '9812345672',
            address: { city: 'Bengaluru', state: 'Karnataka', zipCode: '560001', country: 'India' }
        }
    },
    {
        user: { name: 'BookBazaar', email: 'bookbazaar@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'BookBazaar India',
            storeDescription: 'Every book you love, at every price.',
            storeLogo: 'https://img.icons8.com/color/96/books.png',
            phone: '9812345673',
            address: { city: 'Kolkata', state: 'West Bengal', zipCode: '700001', country: 'India' }
        }
    },
    {
        user: { name: 'SportsPlanet', email: 'sportsplanet@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'SportsPlanet Pro',
            storeDescription: 'Gear up for every sport and fitness goal.',
            storeLogo: 'https://img.icons8.com/color/96/sports-mode.png',
            phone: '9812345674',
            address: { city: 'Hyderabad', state: 'Telangana', zipCode: '500001', country: 'India' }
        }
    },
    {
        user: { name: 'GlowBeauty', email: 'glowbeauty@bloomandbuy.com', role: 'seller' },
        store: {
            storeName: 'GlowBeauty Studio',
            storeDescription: 'Premium skincare, cosmetics, and wellness products.',
            storeLogo: 'https://img.icons8.com/color/96/cosmetics.png',
            phone: '9812345675',
            address: { city: 'Chennai', state: 'Tamil Nadu', zipCode: '600001', country: 'India' }
        }
    },
];

const getProducts = (sellersMap) => [
    // ---- TechZone India (Electronics) ----
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'The most powerful Galaxy yet with AI camera, 200MP sensor, S-Pen, and 5000mAh battery.',
        category: 'Electronics',
        price: 124999,
        basePrice: 124999,
        brand: 'Samsung',
        imageURL: 'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s928bzkcins/gallery/in-galaxy-s24-ultra-s928-sm-s928bzkcins-537027576?$684_547_PNG$',
        images: [
            'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s928bzkcins/gallery/in-galaxy-s24-ultra-s928-sm-s928bzkcins-537027576?$684_547_PNG$',
            'https://images.samsung.com/is/image/samsung/p6pim/in/sm-s928bzkcins/gallery/in-galaxy-s24-ultra-sm-s928bzkcins-537027585?$684_547_PNG$',
        ],
        stockQuantity: 50,
        approvalStatus: 'approved',
        averageRating: 4.8,
        numReviews: 234,
        tags: ['smartphone', 'samsung', '5g', 'spen'],
        seller: sellersMap['TechZone India'],
    },
    {
        name: 'Apple MacBook Air M3',
        description: 'Supercharged by M3 chip with 18-hour battery life, Liquid Retina display, and silent fanless design.',
        category: 'Electronics',
        price: 114900,
        basePrice: 114900,
        brand: 'Apple',
        imageURL: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034',
        images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mba13-midnight-select-202402?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1708367688034'],
        stockQuantity: 30,
        approvalStatus: 'approved',
        averageRating: 4.9,
        numReviews: 189,
        tags: ['laptop', 'apple', 'm3', 'macbook'],
        seller: sellersMap['TechZone India'],
    },
    {
        name: 'Sony WH-1000XM5 Headphones',
        description: 'Industry-leading noise cancellation, 30-hour battery, multipoint connection, and premium audio.',
        category: 'Electronics',
        price: 26990,
        basePrice: 26990,
        brand: 'Sony',
        imageURL: 'https://www.bhphotovideo.com/images/images2500x2500/sony_wh1000xm5_b_wh_1000xm5_wireless_industry_leading_1655806.jpg',
        images: ['https://www.bhphotovideo.com/images/images2500x2500/sony_wh1000xm5_b_wh_1000xm5_wireless_industry_leading_1655806.jpg'],
        stockQuantity: 80,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 312,
        tags: ['headphones', 'noise-cancelling', 'sony', 'wireless'],
        seller: sellersMap['TechZone India'],
    },
    {
        name: 'OnePlus 12 5G',
        description: 'Snapdragon 8 Gen 3, 50MP Hasselblad triple camera, 100W SUPERVOOC charging, 6.82" LTPO AMOLED.',
        category: 'Electronics',
        price: 64999,
        basePrice: 64999,
        brand: 'OnePlus',
        imageURL: 'https://image01.oneplus.net/ebp/202312/19/1-m00-53-d6-rb8bwmv8c4yairpqaalyb6yxsfy562_840_840.webp',
        images: ['https://image01.oneplus.net/ebp/202312/19/1-m00-53-d6-rb8bwmv8c4yairpqaalyb6yxsfy562_840_840.webp'],
        stockQuantity: 45,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 156,
        tags: ['oneplus', 'smartphone', '5g', 'hasselblad'],
        seller: sellersMap['TechZone India'],
    },
    {
        name: 'iPad Pro 11" M4',
        description: 'The thinnest Apple product ever with Ultra Retina XDR display, M4 chip and Apple Intelligence.',
        category: 'Electronics',
        price: 99900,
        basePrice: 99900,
        brand: 'Apple',
        imageURL: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1713920560545',
        images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-model-select-gallery-2-202405?wid=5120&hei=2880&fmt=p-jpg&qlt=95&.v=1713920560545'],
        stockQuantity: 25,
        approvalStatus: 'approved',
        averageRating: 4.8,
        numReviews: 98,
        tags: ['ipad', 'apple', 'tablet', 'm4'],
        seller: sellersMap['TechZone India'],
    },
    {
        name: 'Boat Airdopes 141 TWS',
        description: 'True wireless earbuds with 42-hour total playback, BEAST mode, IPX4 resistance, and instant voice assistant.',
        category: 'Electronics',
        price: 1299,
        basePrice: 1299,
        brand: 'Boat',
        imageURL: 'https://cdn.shopify.com/s/files/1/0057/8938/4802/products/Airdopes141_BlackVoi_1.jpg',
        images: ['https://cdn.shopify.com/s/files/1/0057/8938/4802/products/Airdopes141_BlackVoi_1.jpg'],
        stockQuantity: 200,
        approvalStatus: 'approved',
        averageRating: 4.3,
        numReviews: 4521,
        tags: ['earbuds', 'tws', 'boat', 'wireless'],
        seller: sellersMap['TechZone India'],
    },

    // ---- StyleKart Fashion (Clothing) ----
    {
        name: "Men's Premium Cotton Shirt",
        description: 'Slim-fit premium cotton shirt with wrinkle-resistant fabric. Perfect for office and casual outings.',
        category: 'Clothing',
        price: 1299,
        basePrice: 1299,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'],
        stockQuantity: 150,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 892,
        tags: ['shirt', 'cotton', 'mens', 'formal'],
        seller: sellersMap['StyleKart'],
    },
    {
        name: "Women's Floral Kurti",
        description: 'Elegant floral-print Kurti made from breathable cotton-linen blend. Available in S–3XL.',
        category: 'Clothing',
        price: 899,
        basePrice: 899,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1583846712609-ead4a8932a7f?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1583846712609-ead4a8932a7f?w=800&q=80'],
        stockQuantity: 200,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 1203,
        tags: ['kurti', 'women', 'ethnic', 'floral'],
        seller: sellersMap['StyleKart'],
    },
    {
        name: 'Denim Jacket – Washed Blue',
        description: 'Classic washed-effect denim jacket with stretch fabric for a modern fit. Unisex style.',
        category: 'Clothing',
        price: 2499,
        basePrice: 2499,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80'],
        stockQuantity: 90,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 543,
        tags: ['jacket', 'denim', 'unisex', 'casual'],
        seller: sellersMap['StyleKart'],
    },
    {
        name: "Kids' Graphic T-Shirt Pack (3)",
        description: 'Pack of 3 colourful graphic tees for children aged 3–12. Soft cotton, easy-wash.',
        category: 'Clothing',
        price: 699,
        basePrice: 699,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80'],
        stockQuantity: 300,
        approvalStatus: 'approved',
        averageRating: 4.4,
        numReviews: 2301,
        tags: ['kids', 'tshirt', 'pack', 'cotton'],
        seller: sellersMap['StyleKart'],
    },
    {
        name: 'Ethnic Silk Saree',
        description: 'Traditional Banarasi silk saree with intricate zari work. Ideal for weddings and festivals.',
        category: 'Clothing',
        price: 4599,
        basePrice: 4599,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'],
        stockQuantity: 60,
        approvalStatus: 'approved',
        averageRating: 4.8,
        numReviews: 729,
        tags: ['saree', 'silk', 'ethnic', 'wedding'],
        seller: sellersMap['StyleKart'],
    },
    {
        name: "Men's Track Pants",
        description: 'Comfortable 4-way stretch track pants with side pockets and elastic waistband.',
        category: 'Clothing',
        price: 799,
        basePrice: 799,
        brand: 'StyleKart',
        imageURL: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
        stockQuantity: 180,
        approvalStatus: 'approved',
        averageRating: 4.3,
        numReviews: 1092,
        tags: ['trackpants', 'sports', 'mens', 'comfortable'],
        seller: sellersMap['StyleKart'],
    },

    // ---- HomeNest (Home & Kitchen) ----
    {
        name: 'Instant Pot Duo 6L Pressure Cooker',
        description: '7-in-1 electric multi cooker: pressure cooker, slow cooker, rice cooker, steamer, sauté pan & warmer.',
        category: 'Home & Kitchen',
        price: 8999,
        basePrice: 8999,
        brand: 'Instant Pot',
        imageURL: 'https://m.media-amazon.com/images/I/71VbBcbRGtL._SL1500_.jpg',
        images: ['https://m.media-amazon.com/images/I/71VbBcbRGtL._SL1500_.jpg'],
        stockQuantity: 70,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 5142,
        tags: ['kitchen', 'cooking', 'pressure-cooker', 'instant-pot'],
        seller: sellersMap['HomeNest'],
    },
    {
        name: 'Philips Air Fryer HD9252',
        description: 'Rapid Air Technology for crispy food with up to 90% less fat. 4.1L capacity. Digital display.',
        category: 'Home & Kitchen',
        price: 12995,
        basePrice: 12995,
        brand: 'Philips',
        imageURL: 'https://www.philips.co.in/c-dam/b2c/category-pages/cooking/air-fryer/HD9252_90-1.jpg',
        images: ['https://www.philips.co.in/c-dam/b2c/category-pages/cooking/air-fryer/HD9252_90-1.jpg'],
        stockQuantity: 45,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 3219,
        tags: ['air-fryer', 'philips', 'kitchen', 'healthy'],
        seller: sellersMap['HomeNest'],
    },
    {
        name: 'Havells Decorative LED Ceiling Light',
        description: 'Modern 36W LED panel light with warm white glow. 5-year warranty, IP44 protection.',
        category: 'Home & Kitchen',
        price: 2299,
        basePrice: 2299,
        brand: 'Havells',
        imageURL: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&q=80'],
        stockQuantity: 120,
        approvalStatus: 'approved',
        averageRating: 4.4,
        numReviews: 812,
        tags: ['light', 'led', 'home-decor', 'havells'],
        seller: sellersMap['HomeNest'],
    },
    {
        name: 'Sleek Fabric Sofa (3+1+1)',
        description: 'Premium 5-seater sofa set with high-density foam, leatherette armrests and solid-wood legs.',
        category: 'Home & Kitchen',
        price: 34999,
        basePrice: 34999,
        brand: 'HomeNest',
        imageURL: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
        stockQuantity: 20,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 432,
        tags: ['sofa', 'furniture', 'living-room', 'comfort'],
        seller: sellersMap['HomeNest'],
    },
    {
        name: 'Non-Stick Cookware Set (5 pcs)',
        description: 'Granite-coated non-stick pans with ergonomic handles. PFOA-free & induction-compatible.',
        category: 'Home & Kitchen',
        price: 3299,
        basePrice: 3299,
        brand: 'HomeNest',
        imageURL: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80'],
        stockQuantity: 100,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 2103,
        tags: ['cookware', 'non-stick', 'kitchen', 'induction'],
        seller: sellersMap['HomeNest'],
    },
    {
        name: 'Bosch Front Load Washing Machine 8kg',
        description: 'EcoSilence Drive motor, ActiveWater Plus technology, 15 wash programs, 1200 RPM spin speed.',
        category: 'Home & Kitchen',
        price: 45990,
        basePrice: 45990,
        brand: 'Bosch',
        imageURL: 'https://media.bosch-home.com/images/6239660419_def_011.jpg/r_stretch/800/480/q_80/6239660419_def_011.jpg',
        images: ['https://media.bosch-home.com/images/6239660419_def_011.jpg/r_stretch/800/480/q_80/6239660419_def_011.jpg'],
        stockQuantity: 15,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 961,
        tags: ['washing-machine', 'bosch', 'appliance', 'front-load'],
        seller: sellersMap['HomeNest'],
    },

    // ---- BookBazaar (Books) ----
    {
        name: 'Rich Dad Poor Dad – Robert Kiyosaki',
        description: 'The worldwide bestseller on financial literacy, investment & the mindset of the rich.',
        category: 'Books',
        price: 349,
        basePrice: 349,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/51Wfcv2IL3L._SX331_BO1,204,203,200_.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/51Wfcv2IL3L._SX331_BO1,204,203,200_.jpg'],
        stockQuantity: 500,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 12041,
        tags: ['finance', 'self-help', 'bestseller', 'kiyosaki'],
        seller: sellersMap['BookBazaar'],
    },
    {
        name: 'Atomic Habits – James Clear',
        description: 'An easy and proven way to build good habits and break bad ones.',
        category: 'Books',
        price: 399,
        basePrice: 399,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/513Y5o-DYtL._SX329_BO1,204,203,200_.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/513Y5o-DYtL._SX329_BO1,204,203,200_.jpg'],
        stockQuantity: 600,
        approvalStatus: 'approved',
        averageRating: 4.9,
        numReviews: 9832,
        tags: ['habits', 'productivity', 'self-improvement', 'james-clear'],
        seller: sellersMap['BookBazaar'],
    },
    {
        name: 'The Alchemist – Paulo Coelho',
        description: "A fable about following your dreams, originally written in Portuguese and translated into 80 languages.",
        category: 'Books',
        price: 249,
        basePrice: 249,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/51Z0nLAfLmL.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/51Z0nLAfLmL.jpg'],
        stockQuantity: 800,
        approvalStatus: 'approved',
        averageRating: 4.8,
        numReviews: 21389,
        tags: ['fiction', 'philosophy', 'coelho', 'bestseller'],
        seller: sellersMap['BookBazaar'],
    },
    {
        name: 'Clean Code – Robert C. Martin',
        description: 'A handbook of agile software craftsmanship. Essential reading for every software developer.',
        category: 'Books',
        price: 799,
        basePrice: 799,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg'],
        stockQuantity: 300,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 3421,
        tags: ['programming', 'coding', 'software', 'clean-code'],
        seller: sellersMap['BookBazaar'],
    },
    {
        name: 'Ikigai – Héctor García',
        description: 'The Japanese secret to a long and happy life. A global phenomenon on finding your purpose.',
        category: 'Books',
        price: 299,
        basePrice: 299,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/81l3rZK4lnL.jpg'],
        stockQuantity: 450,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 7811,
        tags: ['lifestyle', 'wellness', 'japanese', 'purpose'],
        seller: sellersMap['BookBazaar'],
    },
    {
        name: 'Zero to One – Peter Thiel',
        description: 'Notes on startups, or how to build the future. A business bible for entrepreneurs.',
        category: 'Books',
        price: 449,
        basePrice: 449,
        brand: 'BookBazaar',
        imageURL: 'https://images-na.ssl-images-amazon.com/images/I/4137Xg8-cJL._SX323_BO1,204,203,200_.jpg',
        images: ['https://images-na.ssl-images-amazon.com/images/I/4137Xg8-cJL._SX323_BO1,204,203,200_.jpg'],
        stockQuantity: 350,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 5103,
        tags: ['startup', 'business', 'thiel', 'entrepreneurship'],
        seller: sellersMap['BookBazaar'],
    },

    // ---- SportsPlanet (Sports) ----
    {
        name: 'Yonex Astrox 88D Pro Badminton Racket',
        description: 'Professional-grade badminton racket used by elite players. Head-heavy balance, 88g, 3U grade.',
        category: 'Sports',
        price: 14999,
        basePrice: 14999,
        brand: 'Yonex',
        imageURL: 'https://m.media-amazon.com/images/I/61YuDfkFp2L._SL1500_.jpg',
        images: ['https://m.media-amazon.com/images/I/61YuDfkFp2L._SL1500_.jpg'],
        stockQuantity: 40,
        approvalStatus: 'approved',
        averageRating: 4.8,
        numReviews: 1292,
        tags: ['badminton', 'racket', 'yonex', 'sports'],
        seller: sellersMap['SportsPlanet'],
    },
    {
        name: 'Decathlon Gym Weight Gloves',
        description: 'Non-slip grip gloves for weight training. Padded palms, wrist support, moisture-wicking.',
        category: 'Sports',
        price: 499,
        basePrice: 499,
        brand: 'Decathlon',
        imageURL: 'https://contents.mediadecathlon.com/p1926741/k$d83e93c22e2c4bb7da1c8a2cfbe43b5c/sq/300x300/weight-training-grippad-gloves-w900.jpg',
        images: ['https://contents.mediadecathlon.com/p1926741/k$d83e93c22e2c4bb7da1c8a2cfbe43b5c/sq/300x300/weight-training-grippad-gloves-w900.jpg'],
        stockQuantity: 200,
        approvalStatus: 'approved',
        averageRating: 4.4,
        numReviews: 4321,
        tags: ['gym', 'gloves', 'fitness', 'training'],
        seller: sellersMap['SportsPlanet'],
    },
    {
        name: 'Nike Air Max 270 Running Shoes',
        description: 'Max Air heel unit, breathable mesh upper, lightweight rubber outsole. Ultimate comfort for long runs.',
        category: 'Sports',
        price: 11495,
        basePrice: 11495,
        brand: 'Nike',
        imageURL: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png',
        images: ['https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/skwgyqrbfzhu6uyeh0gg/air-max-270-shoes-2V5C4p.png'],
        stockQuantity: 60,
        approvalStatus: 'approved',
        averageRating: 4.7,
        numReviews: 7892,
        tags: ['shoes', 'nike', 'running', 'air-max'],
        seller: sellersMap['SportsPlanet'],
    },
    {
        name: 'Protein Whey – Chocolate 2kg',
        description: 'Premium protein with 24g protein per serving, natural chocolate flavour, no added sugar.',
        category: 'Sports',
        price: 3299,
        basePrice: 3299,
        brand: 'MuscleBlaze',
        imageURL: 'https://m.media-amazon.com/images/I/61oqrPRMIsL._SL1200_.jpg',
        images: ['https://m.media-amazon.com/images/I/61oqrPRMIsL._SL1200_.jpg'],
        stockQuantity: 120,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 9141,
        tags: ['protein', 'supplement', 'whey', 'gym'],
        seller: sellersMap['SportsPlanet'],
    },
    {
        name: 'SG Cricket Bat – English Willow',
        description: 'English Willow Grade 3, short-handle, thick-edged bat. Suitable for hard-ball cricket.',
        category: 'Sports',
        price: 4999,
        basePrice: 4999,
        brand: 'SG',
        imageURL: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80'],
        stockQuantity: 55,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 981,
        tags: ['cricket', 'bat', 'sg', 'willow'],
        seller: sellersMap['SportsPlanet'],
    },
    {
        name: 'Yoga Mat – 6mm Non-Slip',
        description: 'Eco-friendly TPE yoga mat with alignment lines, non-slip surface and carrying strap.',
        category: 'Sports',
        price: 999,
        basePrice: 999,
        brand: 'SportsPlanet',
        imageURL: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
        images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80'],
        stockQuantity: 250,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 3210,
        tags: ['yoga', 'mat', 'fitness', 'non-slip'],
        seller: sellersMap['SportsPlanet'],
    },

    // ---- GlowBeauty (Beauty) ----
    {
        name: "L'Oreal Paris Revitalift Serum 30ml",
        description: '2% pure retinol & hyaluronic acid serum. Reduces wrinkles, firms skin in 4 weeks.',
        category: 'Beauty',
        price: 1199,
        basePrice: 1199,
        brand: "L'Oreal",
        imageURL: 'https://www.lorealparis.co.in/-/media/project/loreal/brand-sites/oap/apac/in/products/skin-care/serum/revitalift-hyaluronic-acid-serum/pk-revitalift-1_5percent-pure-ha-serum-30ml(new)-3600524020484.png',
        images: ['https://www.lorealparis.co.in/-/media/project/loreal/brand-sites/oap/apac/in/products/skin-care/serum/revitalift-hyaluronic-acid-serum/pk-revitalift-1_5percent-pure-ha-serum-30ml(new)-3600524020484.png'],
        stockQuantity: 150,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 6721,
        tags: ['serum', 'skincare', 'retinol', 'loreal'],
        seller: sellersMap['GlowBeauty'],
    },
    {
        name: 'Maybelline Lash Sensational Mascara',
        description: 'Fanning brush fans lashes from root to tip with up to 10× lash multiplying sensation.',
        category: 'Beauty',
        price: 499,
        basePrice: 499,
        brand: 'Maybelline',
        imageURL: 'https://www.maybelline.in/-/media/project/loreal/brand-sites/mny/apac/in/products/eye-makeup/mascara/lash-sensational-sky-high-mascara/mny_in_lash-sensational-sky-high-mascara-blackest-black.png',
        images: ['https://www.maybelline.in/-/media/project/loreal/brand-sites/mny/apac/in/products/eye-makeup/mascara/lash-sensational-sky-high-mascara/mny_in_lash-sensational-sky-high-mascara-blackest-black.png'],
        stockQuantity: 300,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 8912,
        tags: ['mascara', 'makeup', 'maybelline', 'lashes'],
        seller: sellersMap['GlowBeauty'],
    },
    {
        name: 'Biotique Morning Nector Moisturizer 190ml',
        description: 'Nourishing face moisturizer with pure honey, wheat germ & almond oil. 100% botanical extracts.',
        category: 'Beauty',
        price: 299,
        basePrice: 299,
        brand: 'Biotique',
        imageURL: 'https://www.biotique.com/cdn/shop/products/Bio-Honey-Gel-Soothing-Face-Moisturizer-main-image-1.jpg',
        images: ['https://www.biotique.com/cdn/shop/products/Bio-Honey-Gel-Soothing-Face-Moisturizer-main-image-1.jpg'],
        stockQuantity: 400,
        approvalStatus: 'approved',
        averageRating: 4.4,
        numReviews: 5321,
        tags: ['moisturizer', 'natural', 'biotique', 'skincare'],
        seller: sellersMap['GlowBeauty'],
    },
    {
        name: 'Lakme 9-to-5 Flawless Matte Foundation',
        description: 'Matte finish foundation with SPF 8, buildable coverage, 12-hour wear, 25 shades.',
        category: 'Beauty',
        price: 650,
        basePrice: 650,
        brand: 'Lakme',
        imageURL: 'https://www.lakme.com/mediaSA/catalog/product/B/L/BL0076_1.jpg',
        images: ['https://www.lakme.com/mediaSA/catalog/product/B/L/BL0076_1.jpg'],
        stockQuantity: 250,
        approvalStatus: 'approved',
        averageRating: 4.5,
        numReviews: 4210,
        tags: ['foundation', 'makeup', 'lakme', 'matte'],
        seller: sellersMap['GlowBeauty'],
    },
    {
        name: 'WOW Activated Charcoal Face Mask 200ml',
        description: 'Deep cleansing peel-off mask with activated charcoal. Removes blackheads, unclogs pores.',
        category: 'Beauty',
        price: 449,
        basePrice: 449,
        brand: 'WOW',
        imageURL: 'https://www.buywow.in/cdn/shop/products/WOW_Activated_Charcoal_Peel_Off_Mask.jpg',
        images: ['https://www.buywow.in/cdn/shop/products/WOW_Activated_Charcoal_Peel_Off_Mask.jpg'],
        stockQuantity: 330,
        approvalStatus: 'approved',
        averageRating: 4.3,
        numReviews: 7812,
        tags: ['face-mask', 'charcoal', 'wow', 'peel-off'],
        seller: sellersMap['GlowBeauty'],
    },
    {
        name: "Himalaya Men's Active Sport Face Wash 100ml",
        description: "Oil-control formula for men's oily skin. Contains neem leaf extract and purifying minerals.",
        category: 'Beauty',
        price: 199,
        basePrice: 199,
        brand: 'Himalaya',
        imageURL: 'https://www.himalayawellness.in/cdn/shop/products/New-HB-Neem-Face-Wash-200ml-Combo_1_afc79d98-78c2-4b03-8e00-a82e7b4e0d4f.jpg',
        images: ['https://www.himalayawellness.in/cdn/shop/products/New-HB-Neem-Face-Wash-200ml-Combo_1_afc79d98-78c2-4b03-8e00-a82e7b4e0d4f.jpg'],
        stockQuantity: 500,
        approvalStatus: 'approved',
        averageRating: 4.6,
        numReviews: 11203,
        tags: ['face-wash', 'himalaya', 'mens', 'neem'],
        seller: sellersMap['GlowBeauty'],
    },
];

async function seed(isModule = false) {
    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGODB_URI);
            console.log('✅ Connected to MongoDB');
        } else {
            console.log('✅ Using existing MongoDB connection');
        }

        // Clear only the v2 specific users, sellers, and their products so we don't wipe seed.js data
        console.log('🗑  Cleaning up previous v2 records (preserving seed.js data)...');
        const sellerEmails = sellers.map(s => s.user.email);
        const v2Users = await User.find({ email: { $in: sellerEmails } });
        const v2UserIds = v2Users.map(u => u._id);
        const v2Sellers = await Seller.find({ user: { $in: v2UserIds } });
        const v2SellerIds = v2Sellers.map(s => s._id);

        if (v2SellerIds.length > 0) {
            await Product.deleteMany({ seller: { $in: v2SellerIds } });
            await Seller.deleteMany({ _id: { $in: v2SellerIds } });
        }
        await User.deleteMany({ email: { $in: sellerEmails } });

        // Create/Ensure admin user
        const adminEmail = 'admin@bloomandbuy.com';
        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = new User({
                name: 'Super Admin',
                email: adminEmail,
                passwordHash: 'Admin@1234',
                role: 'admin',
            });
            await adminUser.save();
            console.log('👑 Admin created: admin@bloomandbuy.com / Admin@1234');
        } else {
            console.log('👑 Admin already exists:', adminEmail);
        }

        // Add default buyer accounts
        const defaultBuyers = [
            { name: 'Arpit', email: 'arpit@example.com', passwordHash: 'Test123!', role: 'user' },
            { name: 'Rani', email: 'rani@example.com', passwordHash: 'Test123!', role: 'user' },
            { name: 'Jamuna Rani Sahu', email: 'jamunaranisahu3@gmail.com', passwordHash: 'Test123!', role: 'user' }
        ];

        for (const buyer of defaultBuyers) {
            let buyerUser = await User.findOne({ email: buyer.email });
            if (!buyerUser) {
                buyerUser = new User(buyer);
                await buyerUser.save();
                console.log(`👤 Buyer created: ${buyer.email} / ${buyer.passwordHash}`);
            }
        }

        // Build a map from storeName -> sellerId
        const sellersMap = {};

        for (const s of sellers) {
            // Create user
            const user = new User({
                name: s.user.name,
                email: s.user.email,
                passwordHash: 'Seller@1234',
                role: 'seller',
            });
            await user.save();

            // Create seller profile
            const seller = new Seller({ user: user._id, ...s.store });
            await seller.save();

            sellersMap[s.store.storeName] = seller._id;
            console.log(`🏪 Seller created: ${s.store.storeName}`);
        }

        // Create products
        const products = getProducts(sellersMap);
        for (const p of products) {
            const product = new Product(p);
            await product.save();
        }

        console.log(`✅ Seeded ${products.length} products across ${sellers.length} sellers!`);

        // Summary
        const summary = await Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
        ]);

        console.log('\n📊 Products by Category:');
        summary.forEach(s => console.log(`   ${s._id}: ${s.count}`));
        console.log('\n🎉 Seed complete!');
        if (!isModule) process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        if (!isModule) process.exit(1);
        throw err;
    }
}

if (require.main === module) {
    seed();
}

module.exports = { seed };
