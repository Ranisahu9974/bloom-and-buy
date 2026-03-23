const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send "Login Successful" email to user
 * @param {string} toEmail - recipient email
 * @param {string} name - recipient's name
 */
const sendLoginEmail = async (toEmail, name) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Bloom&Buy" <noreply@bloomandbuy.com>',
            to: toEmail,
            subject: 'Login Successful - Bloom&Buy',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 0;">
                    <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🌸 Bloom&Buy</h1>
                        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 16px;">Your Favourite Shopping Destination</p>
                    </div>
                    <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <h2 style="color: #1e293b; margin: 0 0 16px; font-size: 22px;">Welcome back, ${name}! 👋</h2>
                        <p style="color: #475569; line-height: 1.7; font-size: 16px; margin: 0 0 20px;">
                            You are logged in successfully to <strong>Bloom&Buy</strong>. Your account is secure and ready to shop!
                        </p>
                        <div style="background: #f1f5f9; border-left: 4px solid #6366f1; padding: 16px 20px; border-radius: 0 8px 8px 0; margin: 20px 0;">
                            <p style="color: #374151; margin: 0; font-size: 14px;">⏰ <strong>Login time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
                            If you didn't log in, please <a href="#" style="color: #6366f1; text-decoration: none; font-weight: 600;">reset your password</a> immediately.
                        </p>
                        <div style="text-align: center; margin: 30px 0 0;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/products" 
                               style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                🛒 Start Shopping
                            </a>
                        </div>
                    </div>
                    <p style="text-align: center; color: #94a3b8; font-size: 12px; margin: 20px 0;">
                        &copy; 2024 Bloom&Buy · All rights reserved
                    </p>
                </div>
            `,
        });
        console.log(`✅ Login email sent to ${toEmail}`);
    } catch (error) {
        console.error('❌ Failed to send login email:', error.message);
        // Don't throw — email failure should not block login
    }
};

/**
 * Send "Order Placed" confirmation email
 */
const sendOrderEmail = async (toEmail, name, orderId, total) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '"Bloom&Buy" <noreply@bloomandbuy.com>',
            to: toEmail,
            subject: `Order Confirmed! #${orderId} - Bloom&Buy`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                        <h1 style="color: white; margin: 0;">✅ Order Confirmed!</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                        <p style="color: #374151; font-size: 16px;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #475569;">Your order has been placed successfully on <strong>Bloom&Buy</strong>.</p>
                        <p style="color: #475569;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="color: #475569;"><strong>Total Amount:</strong> ₹${total}</p>
                        <p style="color: #475569;">We'll notify you when your order ships. Happy shopping! 🛍️</p>
                    </div>
                </div>
            `,
        });
    } catch (error) {
        console.error('❌ Failed to send order email:', error.message);
    }
};

module.exports = { sendLoginEmail, sendOrderEmail };
