/**
 * Format a number as Indian Rupees (INR).
 * Uses Intl.NumberFormat with 'en-IN' locale for proper Indian comma separation.
 * Example: formatINR(16599) => "₹16,599"
 */
export const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.round(amount || 0));
};

