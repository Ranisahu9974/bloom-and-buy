import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, reviewsAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiShoppingCart, FiStar, FiPackage, FiShield, FiTruck, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import PremiumImage from '../components/PremiumImage';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [showReviewForm, setShowReviewForm] = useState(false);

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await productsAPI.getById(id);
            setProduct(data);
        } catch (error) {
            toast.error('Product not found');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const { data } = await reviewsAPI.getByProduct(id);
            setReviews(data.reviews || []);
        } catch (error) {
            console.error('Failed to fetch reviews');
        }
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login first');
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id, quantity);
            toast.success('Added to cart!');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            await reviewsAPI.create({ productId: id, ...reviewForm });
            toast.success('Review submitted!');
            setShowReviewForm(false);
            setReviewForm({ rating: 5, comment: '' });
            fetchReviews();
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to submit review');
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar key={i} size={16} fill={i < (rating || 0) ? '#f59e0b' : 'none'} color={i < (rating || 0) ? '#f59e0b' : '#64748b'} />
        ));
    };

    if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;
    if (!product) return null;

    const hasDiscount = product.basePrice > product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.price / product.basePrice) * 100) : 0;

    const stockStatus = product.stockQuantity > (product.lowStockThreshold || 10)
        ? { class: 'in-stock', text: 'In Stock' }
        : product.stockQuantity > 0
            ? { class: 'low-stock', text: `Only ${product.stockQuantity} left` }
            : { class: 'out-of-stock', text: 'Out of Stock' };

    return (
        <div className="main-content">
            <div className="container product-detail">
                <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: '20px' }}>
                    <FiArrowLeft /> Back
                </button>

                <div className="product-detail-layout">
                    <div className="product-gallery">
                        <PremiumImage
                            src={product.imageURL}
                            alt={product.name}
                        />
                        <div className="product-card-badges" style={{ margin: '16px' }}>
                            {discountPercent > 0 && <span className="badge badge-discount">-{discountPercent}% OFF</span>}
                            {product.seasonalTag && <span className="badge badge-seasonal">{product.seasonalTag}</span>}
                            {product.isClearance && <span className="badge badge-clearance">Clearance</span>}
                            {product.isNearExpiry && <span className="badge badge-near-expiry">Expiring Soon</span>}
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="product-meta">
                            <span className="product-card-category">{product.category}</span>
                            {product.brand && (
                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>by {product.brand}</span>
                            )}
                        </div>

                        {/* Seller Info */}
                        {product.seller && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '10px 14px', marginTop: '8px', marginBottom: '4px',
                                background: 'rgba(99,102,241,0.06)',
                                border: '1px solid rgba(99,102,241,0.12)',
                                borderRadius: '10px', width: 'fit-content'
                            }}>
                                {product.seller.storeLogo && (
                                    <img src={product.seller.storeLogo} alt="store" style={{
                                        width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover'
                                    }} />
                                )}
                                <div>
                                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                        {product.seller.storeName}
                                    </div>
                                    {product.seller.user?.name && (
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Sold by {product.seller.user.name}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <h1>{product.name}</h1>

                        <div className="product-card-rating" style={{ margin: '12px 0' }}>
                            <div className="stars">{renderStars(Math.round(product.averageRating || 0))}</div>
                            <span className="rating-count">{(product.averageRating || 0).toFixed(1)} ({product.numReviews || 0} reviews)</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '8px' }}>
                            <div className="product-detail-price">{formatINR(product.price)}</div>
                            {hasDiscount && (
                                <div style={{ color: 'var(--text-muted)', textDecoration: 'line-through', fontSize: '1.1rem' }}>
                                    {formatINR(product.basePrice)}
                                </div>
                            )}
                            {hasDiscount && (
                                <span style={{ color: 'var(--success)', fontWeight: '700', fontSize: '0.9rem' }}>
                                    Save {discountPercent}%
                                </span>
                            )}
                        </div>

                        <div className="stock-status">
                            <span className={`stock-dot ${stockStatus.class}`} />
                            <span style={{ color: stockStatus.class === 'in-stock' ? 'var(--success)' : stockStatus.class === 'low-stock' ? 'var(--warning)' : 'var(--error)' }}>
                                {stockStatus.text}
                            </span>
                        </div>

                        <p className="product-description">{product.description}</p>

                        {/* Features */}
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <FiTruck color="var(--success)" /> Free shipping on Gold
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <FiShield color="var(--info)" /> Secure payment
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <FiPackage color="var(--accent)" /> Easy returns
                            </div>
                        </div>

                        {/* Quantity & Add to Cart */}
                        {product.stockQuantity > 0 && (
                            <div className="product-actions">
                                <div className="quantity-control">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}>+</button>
                                </div>
                                <button className="btn btn-primary btn-lg" onClick={handleAddToCart} style={{ flex: 1 }}>
                                    <FiShoppingCart /> Add to Cart — {formatINR(product.price * quantity)}
                                </button>
                            </div>
                        )}

                        {product.tags?.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                                {product.tags.map(tag => (
                                    <span key={tag} style={{
                                        padding: '4px 12px',
                                        background: 'rgba(99,102,241,0.1)',
                                        border: '1px solid rgba(99,102,241,0.2)',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        color: 'var(--primary-light)'
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div style={{ marginTop: '60px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 className="page-title">Customer Reviews</h2>
                        {isAuthenticated && (
                            <button className="btn btn-secondary" onClick={() => setShowReviewForm(!showReviewForm)}>
                                Write a Review
                            </button>
                        )}
                    </div>

                    {showReviewForm && (
                        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Write Your Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Rating</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                                            >
                                                <FiStar size={24} fill={n <= reviewForm.rating ? '#f59e0b' : 'none'} color={n <= reviewForm.rating ? '#f59e0b' : '#64748b'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Comment</label>
                                    <textarea
                                        className="form-input"
                                        rows="4"
                                        placeholder="Share your experience with this product..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        required
                                        minLength={5}
                                    />
                                </div>
                                <button className="btn btn-primary" type="submit">Submit Review</button>
                            </form>
                        </div>
                    )}

                    {reviews.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px' }}>
                            <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        <div className="glass-card">
                            {reviews.map(review => (
                                <div key={review._id} className="review-card">
                                    <div className="review-header">
                                        <div className="reviewer-avatar">
                                            {review.user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{review.user?.name || 'Anonymous'}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div className="stars">{renderStars(review.rating)}</div>
                                                {review.trustLevel && (
                                                    <span className={`trust-badge ${review.trustLevel.toLowerCase()}`}>
                                                        {review.trustLevel} Trust
                                                    </span>
                                                )}
                                                {review.isVerifiedPurchase && (
                                                    <span className="verified-badge"><FiCheck size={12} /> Verified</span>
                                                )}
                                            </div>
                                        </div>
                                        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Sticky Add to Cart */}
            {product.stockQuantity > 0 && (
                <div className="mobile-sticky-actions">
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {formatINR(product.price * quantity)}
                        </div>
                        {hasDiscount && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--success)' }}>
                                Save {discountPercent}%
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={handleAddToCart} style={{ padding: '12px 24px' }}>
                        <FiShoppingCart /> Add to Cart
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductDetailPage;
