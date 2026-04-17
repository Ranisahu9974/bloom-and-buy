import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiCreditCard, FiCheck, FiSmartphone, FiPackage, FiInfo } from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import AddressSelector from '../components/AddressSelector';

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

const CheckoutPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart, subtotal, clearCart } = useCart();
    const { user } = useAuth();

    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(false);

    // ─────────────── Dynamic Pricing Logic ───────────────
    const pricing = useMemo(() => {
        const SELLER_STATE = "Maharashtra";
        const SPECIAL_CITIES = ["Mumbai", "Pune", "Bangalore", "Delhi", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Surat", "Pune", "Jaipur", "Lucknow", "Patna"];
        
        // 1. Base Discount (10% auto discount above 1000)
        let discount = 0;
        if (subtotal > 1000) {
            discount = Math.round(subtotal * 0.10);
        }

        // 2. Dynamic Locality/City Discount (Bonus 5% for Special Cities)
        let areaDiscount = 0;
        if (selectedAddress && SPECIAL_CITIES.includes(selectedAddress.city)) {
            areaDiscount = Math.round((subtotal - discount) * 0.05);
        }

        const totalDiscount = discount + areaDiscount;

        // 3. Shipping (Free above 500, else calculated by city)
        let shipping = 0;
        if (subtotal < 500) {
            shipping = (selectedAddress?.state === SELLER_STATE) ? 40 : 80;
        }

        // 4. Tax (18% Total GST)
        const taxableAmount = subtotal - totalDiscount;
        const taxTotal = Math.round(taxableAmount * 0.18);
        
        let cgst = 0, sgst = 0, igst = 0;
        const isInternal = selectedAddress?.state?.toLowerCase().trim() === SELLER_STATE.toLowerCase();

        if (selectedAddress) {
            if (isInternal) {
                cgst = Math.round(taxTotal / 2);
                sgst = taxTotal - cgst;
            } else {
                igst = taxTotal;
            }
        } else {
            // Default/Preview tax
            igst = taxTotal;
        }

        const total = subtotal - totalDiscount + taxTotal + shipping;

        return { 
            subtotal, 
            discount: totalDiscount, 
            baseDiscount: discount, 
            areaDiscount, 
            shipping, 
            taxTotal, 
            cgst, 
            sgst, 
            igst, 
            total 
        };
    }, [subtotal, selectedAddress]);


    const handleCheckoutAndPay = async (e) => {
        e.preventDefault();
        if (!selectedAddress) {
            toast.error('Please select or add a delivery address');
            return;
        }

        setLoading(true);
        try {
            // 1. Initiate Order & Payment
            const { data } = await ordersAPI.checkout({
                address_id: selectedAddress.id,
                total: pricing.total
            });

            if (data.mock) {
                toast.success('Demo order created successfully.');
                await clearCart();
                navigate(`/orders/tracking/${data.order_id}`);
                return;
            }

            if (!data.key) {
                toast.error('Payment gateway configuration is missing. Please contact support.');
                setLoading(false);
                return;
            }

            // 2. Load Razorpay
            const loaded = await loadRazorpay();
            if (!loaded) {
                toast.error('Razorpay library failed to load');
                setLoading(false);
                return;
            }

            // 3. Open Razorpay Modal
            const options = {
                key: data.key,
                amount: data.total * 100,
                currency: data.currency || 'INR',
                name: 'Bloom & Buy',
                description: `Order #${data.order_id}`,
                order_id: data.razorpay_order_id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || '',
                    contact: selectedAddress.phone_number
                },
                theme: { color: '#6366f1' },
                handler: async (response) => {
                    try {
                        const verifyRes = await paymentAPI.verify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        
                        toast.success('Payment Verified! Order Confirmed. 🎉');
                        await clearCart();
                        navigate(`/orders/tracking/${verifyRes.data.order_id}`);
                    } catch (err) {
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error('Payment cancelled');
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to initiate checkout');
            setLoading(false);
        }
    };

    if (!cart.items?.length) {
        return <div className="container" style={{ padding: '100px', textAlign: 'center' }}><h2>Empty Cart</h2><button className="btn btn-primary" onClick={() => navigate('/products')}>Shop Now</button></div>;
    }

    return (
        <div className="main-content">
            <div className="container" style={{ maxWidth: '1200px', padding: '40px 20px' }}>
                <h1 className="page-title">Checkout</h1>
                
                <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '30px' }}>
                    
                    <div className="checkout-content">
                        <section className="checkout-section">
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FiPackage color="var(--action)" /> Delivery Address
                            </h3>
                            <AddressSelector 
                                onSelect={(addr) => setSelectedAddress(addr)} 
                                selectedId={selectedAddress?.id} 
                            />
                        </section>

                        <section className="checkout-section" style={{ marginTop: '30px' }}>
                            <h3 style={{ marginBottom: '16px' }}>💳 Payment Method</h3>
                            <div className="glass-card payment-card selected" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div className="icon-box" style={{ background: 'var(--action-dim)', padding: '10px', borderRadius: '12px' }}>
                                    <FiSmartphone size={24} color="var(--action)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '700' }}>Razorpay Secure Checkout</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>UPI, Credit/Debit Cards, NetBanking, Wallets</div>
                                </div>
                                <FiCheck color="var(--action)" size={20} />
                            </div>
                        </section>
                    </div>

                    <aside className="order-sidebar">
                        <div className="glass-card summary-card" style={{ padding: '24px', position: 'sticky', top: '100px' }}>
                            <h3 style={{ borderBottom: '1px solid var(--border)', paddingBottom: '15px', marginBottom: '15px' }}>Order Summary</h3>
                            
                            <div className="item-list" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
                                {cart.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-main)' }}>{item.product.name} <small style={{ color: 'var(--text-muted)' }}>×{item.quantity}</small></span>
                                        <span style={{ fontWeight: '500' }}>{formatINR(item.product.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pricing-breakdown" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div className="summary-row"><span>Subtotal</span><span>{formatINR(pricing.subtotal)}</span></div>
                                
                                {pricing.baseDiscount > 0 && (
                                     <div className="summary-row" style={{ color: 'var(--success)' }}>
                                         <span>Volume Discount (10%)</span>
                                         <span>-{formatINR(pricing.baseDiscount)}</span>
                                     </div>
                                 )}
                                 {pricing.areaDiscount > 0 && (
                                     <div className="summary-row" style={{ color: 'var(--success)' }}>
                                         <span>Locality Bonus (5%)</span>
                                         <span>-{formatINR(pricing.areaDiscount)}</span>
                                     </div>
                                 )}

                                {pricing.igst > 0 ? (
                                    <div className="summary-row">
                                        <span>IGST (18%)</span>
                                        <span>{formatINR(pricing.igst)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="summary-row">
                                            <span>CGST (9%)</span>
                                            <span>{formatINR(pricing.cgst)}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>SGST (9%)</span>
                                            <span>{formatINR(pricing.sgst)}</span>
                                        </div>
                                    </>
                                )}

                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span style={{ color: pricing.shipping === 0 ? 'var(--success)' : 'inherit' }}>
                                        {pricing.shipping === 0 ? 'FREE' : formatINR(pricing.shipping)}
                                    </span>
                                </div>

                                <div className="total-row" style={{ borderTop: '1px solid var(--border)', paddingTop: '15px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>Total</span>
                                    <span style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--action)' }}>{formatINR(pricing.total)}</span>
                                </div>
                            </div>

                            <button 
                                className="btn btn-primary btn-full btn-lg" 
                                style={{ marginTop: '24px', height: '56px', fontSize: '1.1rem' }} 
                                disabled={loading || !selectedAddress}
                                onClick={handleCheckoutAndPay}
                            >
                                {loading ? 'Processing...' : `Pay ${formatINR(pricing.total)}`}
                            </button>

                            {!selectedAddress && (
                                <p style={{ fontSize: '0.75rem', color: '#ff4d4d', textAlign: 'center', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                    <FiInfo size={12} /> Please select an address to continue
                                </p>
                            )}
                        </div>
                    </aside>

                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
