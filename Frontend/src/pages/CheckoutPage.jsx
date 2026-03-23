import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI, payLaterAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiMapPin, FiCreditCard, FiCheck, FiSmartphone, FiPackage } from 'react-icons/fi';
import { formatINR } from '../utils/currency';

// ─────────────── Address Data ───────────────
const ADDRESS_DATA = {
    India: {
        states: [
            'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
            'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
            'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
            'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
            'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
        ],
        cities: {
            Maharashtra: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad','Thane'],
            Delhi: ['New Delhi','Dwarka','Rohini','Noida Extension'],
            Karnataka: ['Bengaluru','Mysuru','Hubli','Mangaluru'],
            Tamil_Nadu: ['Chennai','Coimbatore','Madurai','Salem'],
            Gujarat: ['Ahmedabad','Surat','Vadodara','Rajkot'],
            'Uttar Pradesh': ['Lucknow','Kanpur','Varanasi','Agra','Prayagraj'],
            'West Bengal': ['Kolkata','Howrah','Durgapur','Asansol'],
            Rajasthan: ['Jaipur','Jodhpur','Udaipur','Kota'],
            'Andhra Pradesh': ['Visakhapatnam','Vijayawada','Guntur'],
            Telangana: ['Hyderabad','Warangal','Karimnagar'],
        },
        areas: {
            Mumbai: [{area:'Andheri',pin:'400053'},{area:'Bandra',pin:'400050'},{area:'Colaba',pin:'400001'},{area:'Dadar',pin:'400014'},{area:'Kurla',pin:'400070'}],
            Bengaluru: [{area:'Koramangala',pin:'560034'},{area:'Indiranagar',pin:'560038'},{area:'Whitefield',pin:'560066'},{area:'Jayanagar',pin:'560041'}],
            Chennai: [{area:'Adyar',pin:'600020'},{area:'Anna Nagar',pin:'600040'},{area:'T Nagar',pin:'600017'},{area:'Velachery',pin:'600042'}],
            'New Delhi': [{area:'Connaught Place',pin:'110001'},{area:'Lajpat Nagar',pin:'110024'},{area:'Karol Bagh',pin:'110005'},{area:'Saket',pin:'110017'}],
            Hyderabad: [{area:'Banjara Hills',pin:'500034'},{area:'Jubilee Hills',pin:'500033'},{area:'Hitech City',pin:'500081'},{area:'Secunderabad',pin:'500003'}],
            Pune: [{area:'Koregaon Park',pin:'411001'},{area:'Baner',pin:'411045'},{area:'Hadapsar',pin:'411028'}],
            Ahmedabad: [{area:'Navrangpura',pin:'380009'},{area:'Bopal',pin:'380058'},{area:'Vastrapur',pin:'380054'}],
            Kolkata: [{area:'Park Street',pin:'700016'},{area:'Salt Lake',pin:'700064'},{area:'Gariahat',pin:'700029'}],
        }
    }
};

const COUNTRIES = ['India'];

// ─────────────── Razorpay Loader ───────────────
const loadRazorpay = () =>
    new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

// ─────────────── Main Component ───────────────
const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, subtotal, clearCart } = useCart();
    const { user } = useAuth();

    const [country, setCountry] = useState('India');
    const [state, setState] = useState(user?.address?.state || '');
    const [city, setCity] = useState(user?.address?.city || '');
    const [area, setArea] = useState('');
    const [street, setStreet] = useState(user?.address?.street || '');
    const [zipCode, setZipCode] = useState(user?.address?.zipCode || '');

    const [paymentMethod, setPaymentMethod] = useState('Razorpay');
    const [promoCode] = useState(location.state?.promoCode || '');
    const [discountAmount] = useState(location.state?.discountAmount || 0);
    const [loading, setLoading] = useState(false);


    const states = ADDRESS_DATA[country]?.states || [];
    const cities = state
        ? (ADDRESS_DATA[country]?.cities?.[state] || ADDRESS_DATA[country]?.cities?.[state.replace(' ', '_')] || [])
        : [];
    const areas = city ? (ADDRESS_DATA[country]?.areas?.[city] || []) : [];

    const handleAreaChange = (e) => {
        const selected = areas.find(a => a.area === e.target.value);
        setArea(e.target.value);
        if (selected) setZipCode(selected.pin);
    };

    const shippingCost = subtotal > 4150 ? 0 : 50;
    const taxable = Math.max(0, subtotal - discountAmount);
    const tax = taxable * 0.08;
    const total = Math.max(0, subtotal - discountAmount + shippingCost + tax);

    const buildShippingAddress = () => ({
        street: `${street}${area ? ', ' + area : ''}`,
        city,
        state,
        zipCode,
        country,
    });

    const handleRazorpayPayment = async () => {
        const loaded = await loadRazorpay();
        if (!loaded) {
            toast.error('Failed to load Razorpay. Please check your connection.');
            return false;
        }

        const { data } = await paymentAPI.createOrder(Math.round(total), `order_${Date.now()}`);

        if (data.keyId === 'mock_test_key') {
            toast.success('Test Mode: Payment Auto-Verified!');
            return { success: true, paymentId: `mock_pay_${Date.now()}` };
        }

        return new Promise((resolve) => {
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: 'Bloom&Buy',
                description: 'Secure Payment',
                image: '/logo.png',
                order_id: data.orderId,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: { color: '#6366f1' },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled');
                        resolve({ cancelled: true });
                    }
                },
                handler: async (response) => {
                    try {
                        await paymentAPI.verify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        resolve({ success: true, paymentId: response.razorpay_payment_id });
                    } catch {
                        resolve({ success: false });
                    }
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        });
    };

    const processOrder = async () => {
        try {
            await ordersAPI.checkout({
                shippingAddress: buildShippingAddress(),
                paymentMethod,
                promoCode,
            });

            toast.success('Order placed successfully! 🛍️');
            await clearCart();
            navigate('/orders');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!street || !city || !state || !zipCode) {
            toast.error('Please fill in all shipping address fields');
            return;
        }

        setLoading(true);
        try {
            const result = await handleRazorpayPayment();
            if (result?.cancelled) { setLoading(false); return; }
            if (!result?.success) {
                toast.error('Payment verification failed.');
                setLoading(false);
                return;
            }
            toast.success('Payment successful! 🎉');
            await processOrder();
        } catch (error) {
            toast.error('Payment failed. Please try again.');
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
                    <p className="page-subtitle">Secure, fast delivery</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="checkout-layout">
                        <div>
                            {/* ── Shipping Address ── */}
                            <div className="checkout-section">
                                <h3><span className="step-number">1</span> <FiMapPin /> Shipping Address</h3>

                                <div className="form-group">
                                    <label className="form-label">Country</label>
                                    <select className="form-select" value={country} onChange={e => { setCountry(e.target.value); setState(''); setCity(''); setArea(''); setZipCode(''); }}>
                                        {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <select className="form-select" value={state} onChange={e => { setState(e.target.value); setCity(''); setArea(''); setZipCode(''); }} required>
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <select className="form-select" value={city} onChange={e => { setCity(e.target.value); setArea(''); setZipCode(''); }} required disabled={!state}>
                                            <option value="">Select City</option>
                                            {cities.map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Area / Locality</label>
                                        <input 
                                            className="form-input" 
                                            list="area-options" 
                                            placeholder="Enter your Area" 
                                            value={area} 
                                            onChange={handleAreaChange} 
                                            disabled={!city}
                                        />
                                        <datalist id="area-options">
                                            {areas.map(a => <option key={a.area} value={a.area} />)}
                                        </datalist>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">PIN Code</label>
                                        <input className="form-input" type="text" placeholder="Auto-filled from area" value={zipCode}
                                            onChange={e => setZipCode(e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Street / House / Flat</label>
                                    <input className="form-input" type="text" placeholder="House No, Building, Street" value={street}
                                        onChange={e => setStreet(e.target.value)} required />
                                </div>
                            </div>

                            {/* ── Payment Method ── */}
                            <div className="checkout-section">
                                <h3><span className="step-number">2</span> <FiCreditCard /> Payment Method</h3>
                                <div className="payment-methods">
                                    <label className={`payment-method ${paymentMethod === 'Razorpay' ? 'selected' : ''}`}>
                                        <input type="radio" name="payment" value="Razorpay"
                                            checked={paymentMethod === 'Razorpay'}
                                            onChange={e => setPaymentMethod(e.target.value)} />
                                        <FiSmartphone />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Razorpay</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI · Cards · NetBanking · QR</div>
                                        </div>
                                        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: '#6366f1', color: '#fff', padding: '2px 8px', borderRadius: '99px' }}>Recommended</span>
                                    </label>

                                    {['Credit Card', 'Debit Card'].map(method => (
                                        <label key={method} className={`payment-method ${paymentMethod === method ? 'selected' : ''}`}>
                                            <input type="radio" name="payment" value={method}
                                                checked={paymentMethod === method}
                                                onChange={e => setPaymentMethod(e.target.value)} />
                                            <FiCreditCard />
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{method}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Secure payment</div>
                                            </div>
                                        </label>
                                    ))}

                                    <label className={`payment-method ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''}`}>
                                        <input type="radio" name="payment" value="Cash on Delivery"
                                            checked={paymentMethod === 'Cash on Delivery'}
                                            onChange={e => setPaymentMethod(e.target.value)} />
                                        <FiPackage />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>Cash on Delivery</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay when you receive</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ── Order Summary ── */}
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
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

                            <div className="summary-row"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
                            {discountAmount > 0 && (
                                <div className="summary-row" style={{ color: 'var(--success)' }}>
                                    <span>Promo Discount</span><span>-{formatINR(discountAmount)}</span>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span style={{ color: shippingCost === 0 ? 'var(--success)' : '' }}>
                                    {shippingCost === 0 ? 'FREE' : formatINR(shippingCost)}
                                </span>
                            </div>
                            <div className="summary-row"><span>Tax (8%)</span><span>{formatINR(tax)}</span></div>
                            <div className="summary-row total"><span>Total</span><span>{formatINR(total)}</span></div>

                            <button type="submit" className="btn btn-primary btn-full btn-lg"
                                disabled={loading} style={{ marginTop: '24px' }}>
                                {loading ? 'Processing...' : `Pay ${formatINR(total)}`}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <FiCheck size={14} color="var(--success)" />
                                Secure checkout · 256-bit SSL encrypted
                            </div>
                        </div>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default CheckoutPage;
