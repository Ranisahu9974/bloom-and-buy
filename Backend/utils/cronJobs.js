const cron = require('node-cron');
const Product = require('../models/Product');
const Cashback = require('../models/Cashback');
const User = require('../models/User');

// Dynamic pricing engine
const runDynamicPricing = async () => {
    try {
        const products = await Product.find({ isActive: true });
        let updated = 0;

        for (const product of products) {
            let multiplier = 1.0;

            // Low stock surge - increase price slightly
            if (product.stockQuantity < product.lowStockThreshold && product.stockQuantity > 0) {
                multiplier = 1.15;
            }
            // Slow-moving discount - decrease price
            else if (product.salesLastWeek < 2 && product.stockQuantity > 50) {
                multiplier = 0.90;
            }
            // High demand - slight increase
            else if (product.salesLastWeek > 20) {
                multiplier = 1.05;
            }

            // Calculate new price: use basePrice as the reference and apply multiplier
            // price should always be <= basePrice (basePrice is the original/higher price)
            const referencePrice = product.basePrice;
            const newPrice = Math.min(referencePrice, referencePrice * multiplier * 0.8);
            // Cap: never go below 40% of basePrice, never exceed basePrice
            const finalPrice = Math.max(referencePrice * 0.4, Math.min(referencePrice, newPrice));

            if (Math.abs(product.price - finalPrice) > 0.01) {
                product.price = Math.round(finalPrice * 100) / 100;
                product.dynamicPriceMultiplier = multiplier;
                await product.save();
                updated++;
            }
        }

        console.log(`[CRON] Dynamic pricing updated ${updated} products`);
    } catch (error) {
        console.error('[CRON] Dynamic pricing error:', error);
    }
};

// Expiry checker
const checkExpiry = async () => {
    try {
        const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        // Mark near-expiry
        await Product.updateMany(
            {
                expiryDate: { $ne: null, $lte: sevenDaysFromNow, $gt: new Date() },
                isNearExpiry: false
            },
            { isNearExpiry: true, isClearance: true }
        );

        // Deactivate expired
        const expired = await Product.updateMany(
            { expiryDate: { $ne: null, $lte: new Date() }, isActive: true },
            { isActive: false }
        );

        if (expired.modifiedCount > 0) {
            console.log(`[CRON] Deactivated ${expired.modifiedCount} expired products`);
        }
    } catch (error) {
        console.error('[CRON] Expiry check error:', error);
    }
};

// Cashback expiry cleanup
const cleanExpiredCashback = async () => {
    try {
        const expired = await Cashback.find({
            isUsed: false,
            expiresAt: { $lte: new Date() }
        });

        for (const cb of expired) {
            cb.isUsed = true;
            await cb.save();

            // Deduct from user wallet
            await User.findByIdAndUpdate(cb.user, {
                $inc: { walletBalance: -cb.amount }
            });
        }

        if (expired.length > 0) {
            console.log(`[CRON] Expired ${expired.length} cashback entries`);
        }
    } catch (error) {
        console.error('[CRON] Cashback cleanup error:', error);
    }
};

// Reset weekly sales counter
const resetWeeklySales = async () => {
    try {
        await Product.updateMany({}, { salesLastWeek: 0 });
        console.log('[CRON] Weekly sales counter reset');
    } catch (error) {
        console.error('[CRON] Weekly reset error:', error);
    }
};

const initCronJobs = () => {
    // Run dynamic pricing every 6 hours
    cron.schedule('0 */6 * * *', runDynamicPricing);

    // Check expiry daily at midnight
    cron.schedule('0 0 * * *', checkExpiry);

    // Clean expired cashback daily at 1 AM
    cron.schedule('0 1 * * *', cleanExpiredCashback);

    // Reset weekly sales every Monday at midnight
    cron.schedule('0 0 * * 1', resetWeeklySales);

    console.log('✅ Cron jobs initialized');
};

module.exports = { initCronJobs, runDynamicPricing, checkExpiry };
