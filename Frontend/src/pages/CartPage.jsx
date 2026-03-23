import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { discountsAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiTrash2, FiShoppingBag, FiTag, FiCheck } from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import PremiumImage from '../components/PremiumImage';
import SkeletonCard from '../components/SkeletonCard';

const CartPage = () => {
    const { cart, subtotal, itemCount, updateQuantity, removeFromCart, loading } = useCart();
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const navigate = useNavigate();

    const handlePromoApply = async () => {
        if (!promoCode.trim()) return;
        setPromoLoading(true);
        try {
            const { data } = await discountsAPI.validate(promoCode, subtotal);
            setPromoResult(data.discount);
            toast.success('Promo code applied!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Invalid promo code');
            setPromoResult(null);
        } finally {
            setPromoLoading(false);
        }
    };

    const finalTotal = promoResult ? promoResult.newTotal : subtotal;
    const discountAmount = promoResult ? promoResult.discountAmount : 0;

    if (loading) {
        return (
            <div className="main-content">
                <div className="container cart-page">
                    <div className="page-header">
                        <div className="skeleton skeleton-text" style={{ width: '250px', height: '32px' }}></div>
                    </div>
                    <div className="cart-layout">
                        <div className="cart-items">
                            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} type="list-item" />)}
                        </div>
                        <div className="cart-summary">
                            <div className="skeleton skeleton-image" style={{ height: '300px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="container cart-page">
                <div className="page-header">
                    <h1 className="page-title">Shopping Cart</h1>
                    <p className="page-subtitle">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
                    </p>
                </div>

                {!cart.items || cart.items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some awesome products to get started!</p>
                        <Link to="/products" className="btn btn-primary">
                            <FiShoppingBag /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="cart-layout">
                        <div className="cart-items">
                            {cart.items.map((item) => {
                                const product = item.product;
                                if (!product) return null;
                                return (
                                    <div key={item._id} className="cart-item">
                                        <div className="cart-item-image">
                                            <PremiumImage
                                                src={product.imageURL}
                                                alt={product.name}
                                                fallbackIconSize={24}
                                            />
                                        </div>
                                        <div className="cart-item-info">
                                            <div className="cart-item-name">{product.name}</div>
                                            <div className="cart-item-category">{product.category}</div>
                                            <div className="cart-item-price">{formatINR(product.price)}</div>
                                            <div className="quantity-control">
                                                <button onClick={() => item.quantity > 1 && updateQuantity(product._id, item.quantity - 1)}>−</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(product._id, item.quantity + 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className="cart-item-actions">
                                            <button className="remove-btn" onClick={() => removeFromCart(product._id)}>
                                                <FiTrash2 />
                                            </button>
                                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                                                {formatINR((product.price || 0) * item.quantity)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-summary">
                            <h3>Order Summary</h3>

                            <div className="summary-row">
                                <span>Subtotal ({itemCount} items)</span>
                                <span>{formatINR(subtotal)}</span>
                            </div>

                            {discountAmount > 0 && (
                                <div className="summary-row" style={{ color: 'var(--success)' }}>
                                    <span>Discount</span>
                                    <span>-{formatINR(discountAmount)}</span>
                                </div>
                            )}

                            <div className="summary-row">
                                <span>Shipping</span>
                                <span style={{ color: subtotal > 4150 ? 'var(--success)' : '' }}>
                                    {subtotal > 4150 ? 'FREE' : formatINR(50)}
                                </span>
                            </div>

                            <div className="summary-row total">
                                <span>Total</span>
                                <span>{formatINR(finalTotal + (subtotal > 4150 ? 0 : 50))}</span>
                            </div>

                            {/* Promo Code */}
                            <div className="promo-section">
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>
                                    <FiTag size={12} /> Promo Code
                                </label>
                                <div className="promo-input">
                                    <input
                                        type="text"
                                        placeholder="ENTER CODE"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    />
                                    <button className="btn btn-secondary btn-sm" onClick={handlePromoApply} disabled={promoLoading}>
                                        {promoLoading ? '...' : 'Apply'}
                                    </button>
                                </div>
                                {promoResult && (
                                    <div className="promo-success">
                                        <FiCheck /> Save {formatINR(promoResult.discountAmount)}
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary btn-full btn-lg"
                                style={{ marginTop: '24px' }}
                                onClick={() => navigate('/checkout', { state: { promoCode: promoResult?.code, discountAmount } })}
                            >
                                Proceed to Checkout
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                <Link to="/products" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
