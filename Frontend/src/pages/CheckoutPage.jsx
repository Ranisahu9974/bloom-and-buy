import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, payLaterAPI, membershipAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiCheck, FiTruck } from 'react-icons/fi';
import { formatINR } from '../utils/currency';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, subtotal, clearCart } = useCart();
    const { user } = useAuth();

    const [shippingAddress, setShippingAddress] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || 'IN'
    });

    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [useCashback, setUseCashback] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [payLaterEligible, setPayLaterEligible] = useState(false);
    const [loading, setLoading] = useState(false);

    const promoCode = location.state?.promoCode || '';
    const discountAmount = location.state?.discountAmount || 0;

    useEffect(() => {
        fetchMembership();
    }, []);

    const fetchMembership = async () => {
        try {
            const { data } = await membershipAPI.getDetails();
            setWalletBalance(data.walletBalance || 0);
        } catch (error) {
            console.error('Failed to fetch membership');
        }
    };

    const checkPayLater = async () => {
        try {
            const { data } = await payLaterAPI.checkEligibility(subtotal);
            setPayLaterEligible(data.eligible);
            if (!data.eligible && data.reasons?.length > 0) {
                toast.error(data.reasons[0]);
            }
        } catch (error) {
            setPayLaterEligible(false);
        }
    };

    const shippingCost = subtotal > 4150 || user?.membershipTier === 'Gold' ? 0 : 497;
    const tierDiscountRate = user?.membershipTier === 'Gold' ? 0.10 : user?.membershipTier === 'Silver' ? 0.05 : 0;
    const tierDiscount = subtotal * tierDiscountRate;
    const cashbackUsed = useCashback ? Math.min(walletBalance, subtotal * 0.5, 4150) : 0;
    const taxable = Math.max(0, subtotal - discountAmount - tierDiscount - cashbackUsed);
    const tax = taxable * 0.08;
    const total = Math.max(0, subtotal - discountAmount - tierDiscount - cashbackUsed + shippingCost + tax);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
            toast.error('Please fill in all shipping address fields');
            return;
        }
        setLoading(true);
        try {
            const { data } = await ordersAPI.checkout({
                shippingAddress,
                paymentMethod,
                promoCode,
                useCashback
            });
            toast.success('Order placed successfully!');
            if (data.cashbackEarned > 0) {
                toast.success(`You earned ${formatINR(data.cashbackEarned)} cashback!`, { duration: 4000 });
            }
            if (data.pointsEarned > 0) {
                toast.success(`+${data.pointsEarned} points earned!`, { duration: 3000 });
            }
            await clearCart();
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="main-content">
                <div className="container checkout-page">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>Browse Products</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="container checkout-page">
                <div className="page-header">
                    <h1 className="page-title">Checkout</h1>
                    <p className="page-subtitle">Complete your order</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-layout">
                        <div>
                            {/* Shipping Address */}
                            <div className="checkout-section">
                                <h3><span className="step-number">1</span> <FiMapPin /> Shipping Address</h3>
                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input className="form-input" type="text" placeholder="123 Main St"
                                        value={shippingAddress.street}
                                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input className="form-input" type="text" placeholder="New York"
                                            value={shippingAddress.city}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input className="form-input" type="text" placeholder="NY"
                                            value={shippingAddress.state}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">ZIP Code</label>
                                        <input className="form-input" type="text" placeholder="10001"
                                            value={shippingAddress.zipCode}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input className="form-input" type="text" value={shippingAddress.country}
                                            onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="checkout-section">
                                <h3><span className="step-number">2</span> <FiCreditCard /> Payment Method</h3>
                                <div className="payment-methods">
                                    {['Credit Card', 'Debit Card'].map(method => (
                                        <label key={method} className={`payment-method ${paymentMethod === method ? 'selected' : ''}`}>
                                            <input type="radio" name="payment" value={method}
                                                checked={paymentMethod === method}
                                                onChange={(e) => setPaymentMethod(e.target.value)} />
                                            <FiCreditCard />
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{method}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure payment</div>
                                            </div>
                                        </label>
                                    ))}

                                    {/* Pay Later option */}
                                    <label className={`payment-method ${paymentMethod === 'Pay Later' ? 'selected' : ''}`}
                                        onClick={() => {
                                            if (paymentMethod !== 'Pay Later') checkPayLater();
                                        }}>
                                        <input type="radio" name="payment" value="Pay Later"
                                            checked={paymentMethod === 'Pay Later'}
                                            onChange={(e) => setPaymentMethod(e.target.value)} />
                                        <FiCreditCard />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Pay Later</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                3 installments (Silver/Gold)
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                {/* Cashback option */}
                                {walletBalance > 0 && (
                                    <div className="cashback-option">
                                        <input type="checkbox" checked={useCashback}
                                            onChange={(e) => setUseCashback(e.target.checked)} />
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Use Wallet Balance</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                Available: {formatINR(walletBalance)} (max ₹4,150 per order)
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="cart-summary">
                            <h3>Order Summary</h3>

                            {/* Items list */}
                            <div style={{ marginBottom: '16px' }}>
                                {cart.items.map(item => item.product && (
                                    <div key={item._id} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem'
                                    }}>
                                        <span style={{ flex: 1 }}>{item.product.name} × {item.quantity}</span>
                                        <span style={{ fontWeight: '600' }}>{formatINR((item.product.price || 0) * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{formatINR(subtotal)}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="summary-row" style={{ color: 'var(--success)' }}>
                                    <span>Promo Discount</span>
                                    <span>-{formatINR(discountAmount)}</span>
                                </div>
                            )}

                            {tierDiscount > 0 && (
                                <div className="summary-row" style={{ color: 'var(--success)' }}>
                                    <span>{user?.membershipTier} Discount ({tierDiscountRate * 100}%)</span>
                                    <span>-{formatINR(tierDiscount)}</span>
                                </div>
                            )}

                            {cashbackUsed > 0 && (
                                <div className="summary-row" style={{ color: 'var(--success)' }}>
                                    <span>Wallet</span>
                                    <span>-{formatINR(cashbackUsed)}</span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span style={{ color: shippingCost === 0 ? 'var(--success)' : '' }}>
                                    {shippingCost === 0 ? 'FREE' : formatINR(shippingCost)}
                                </span>
                            </div>

                            <div className="summary-row">
                                <span>Tax (8%)</span>
                                <span>{formatINR(tax)}</span>
                            </div>

                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{formatINR(total)}</span>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg"
                                disabled={loading} style={{ marginTop: '24px' }}>
                                {loading ? 'Placing Order...' : `Place Order — ${formatINR(total)}`}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <FiCheck size={14} color="var(--success)" />
                                Secure checkout powered by Bloom & Buy
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
