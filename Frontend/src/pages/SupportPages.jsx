import React from 'react';
import { FiHelpCircle, FiTruck, FiRefreshCcw, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const SupportWrapper = ({ title, icon: Icon, children }) => (
    <div className="main-content">
        <div className="container" style={{ maxWidth: '800px', padding: '60px 20px' }}>
            <div className="glass-card" style={{ padding: '40px', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
                    <div style={{ background: 'var(--action-dim)', padding: '12px', borderRadius: '12px', color: 'var(--action)' }}>
                        <Icon size={32} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>{title}</h1>
                </div>
                <div className="support-content" style={{ lineHeight: '1.8', color: 'var(--text-main)' }}>
                    {children}
                </div>
            </div>
        </div>
    </div>
);

export const HelpCenterPage = () => (
    <SupportWrapper title="Help Center" icon={FiHelpCircle}>
        <h3>Frequently Asked Questions</h3>
        <p><strong>How do I track my order?</strong><br/>You can track your order status in the "My Orders" section of your profile or directly via the tracking link sent to your email.</p>
        <p><strong>Is payment secure?</strong><br/>Yes, we use Razorpay for all our transactions, ensuring end-to-end encryption and compliance with international security standards.</p>
        <p><strong>How can I contact a seller?</strong><br/>Currently, all communication is handled via our customer support team for your safety. Use the Contact Us page for any seller-related queries.</p>
    </SupportWrapper>
);

export const ShippingInfoPage = () => (
    <SupportWrapper title="Shipping Info" icon={FiTruck}>
        <h3>Standard Delivery</h3>
        <p>Most orders are delivered within 3-5 business days. We partner with India's leading logistics providers to ensure your package arrives safely.</p>
        <h3>Free Shipping</h3>
        <p>Enjoy free shipping on all orders above ₹500! For orders below this amount, a flat fee of ₹50 applies.</p>
        <h3>Package Tracking</h3>
        <p>Once your order is shipped, you will receive a 10-digit tracking ID to monitor your package journey in real-time.</p>
    </SupportWrapper>
);

export const ReturnsRefundsPage = () => (
    <SupportWrapper title="Returns & Refunds" icon={FiRefreshCcw}>
        <h3>7-Day Return Policy</h3>
        <p>Not satisfied with your purchase? You can return most items within 7 days of delivery. The items must be in original condition with tags intact.</p>
        <h3>Refund Process</h3>
        <p>Once we receive and inspect the returned item, your refund will be processed within 48 hours. The amount will be credited back to your original payment method within 5-7 business days.</p>
        <h3>Non-Returnable Items</h3>
        <p>Personal care items, perishables, and innerwear are not eligible for returns due to hygiene reasons.</p>
    </SupportWrapper>
);

export const ContactUsPage = () => (
    <SupportWrapper title="Contact Us" icon={FiMail}>
        <h3>Reach Out to Us</h3>
        <p>Our support team is available from 10:00 AM to 6:00 PM (Mon-Sat).</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FiMail color="var(--action)" /> <span>support@bloomandbuy.com</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FiPhone color="var(--action)" /> <span>+91 1800-456-7890</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FiMapPin color="var(--action)" /> <span>123, Tech Plaza, Mumbai, Maharashtra 400001</span>
            </div>
        </div>
    </SupportWrapper>
);
