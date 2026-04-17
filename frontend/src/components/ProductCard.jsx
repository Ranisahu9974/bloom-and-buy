import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiHeart, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { wishlistAPI } from '../utils/api';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';
import PremiumImage from './PremiumImage';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const [imageError, setImageError] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        try {
            if (!isAuthenticated) return;
            setIsAdding(true);
            await addToCart(product.id || product._id);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const renderStars = (rating) =>
        Array.from({ length: 5 }, (_, i) => (
            <FiStar
                key={i}
                size={13}
                fill={i < Math.round(rating || 0) ? '#f59e0b' : 'none'}
                color={i < Math.round(rating || 0) ? '#f59e0b' : '#cbd5e1'}
            />
        ));

    const hasDiscount = product.basePrice > product.price;
    const discountPercent = hasDiscount ? Math.round((1 - product.price / product.basePrice) * 100) : 0;
    const isOutOfStock = (product.stockQuantity || product.stock) === 0;

    return (
        <Link
            to={`/products/${product.id || product._id}`}
            className="product-card"
            style={{ position: 'relative', display: 'block', textDecoration: 'none', color: 'inherit' }}
        >
            {/* Inner card content stays same but we need to stop propagation on buttons */}
            <div className="product-card-image">
                <PremiumImage
                    src={product.imageURL}
                    alt={product.name}
                    onImageError={() => setImageError(true)}
                />

                {/* Wishlist Heart */}
                {isAuthenticated && (
                    <button
                        className="wishlist-heart-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            wishlistAPI.add(product._id)
                                .then(() => toast.success('Added to wishlist!'))
                                .catch((err) => {
                                    if (err.response?.status === 400) toast('Already in wishlist', { icon: '💝' });
                                    else toast.error('Failed to add');
                                });
                        }}
                        title="Add to Wishlist"
                    >
                        <FiHeart size={16} />
                    </button>
                )}

                {/* Badges */}
                <div className="product-card-badges">
                    {discountPercent > 0 && (
                        <span className="badge badge-discount">-{discountPercent}%</span>
                    )}
                    {product.seasonalTag && (
                        <span className="badge badge-seasonal">{product.seasonalTag}</span>
                    )}
                    {product.isClearance && (
                        <span className="badge badge-clearance">Clearance</span>
                    )}
                    {product.isNearExpiry && (
                        <span className="badge badge-near-expiry">Expiring Soon</span>
                    )}
                </div>

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(2px)'
                    }}>
                        <span style={{ background: '#374151', color: '#fff', padding: '6px 14px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                            Out of Stock
                        </span>
                    </div>
                )}
                {/* Premium Overlay Actions */}
                <div className="product-card-overlay">
                    <button 
                        className={`quick-add-btn ${isAdded ? 'added' : ''}`}
                        onClick={handleAddToCart}
                        disabled={isOutOfStock || isAdding}
                    >
                        {isAdded ? (
                            <><FiCheck size={18} /> Added</>
                        ) : isAdding ? (
                            <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Adding...</>
                        ) : (
                            <><FiShoppingCart size={18} /> {isOutOfStock ? 'Out of Stock' : 'Quick Add'}</>
                        )}
                    </button>
                </div>
            </div>

            <div className="product-card-body">
                <div className="product-card-category">{product.category}</div>
                {product.seller?.storeName && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', marginBottom: '2px' }}>
                        by {product.seller.storeName}
                    </div>
                )}
                <h3 className="product-card-name">{product.name}</h3>

                <div className="product-card-rating">
                    <div className="stars">{renderStars(product.averageRating)}</div>
                    <span className="rating-count">({product.numReviews || 0})</span>
                </div>

                <div className="product-card-footer">
                    <div className="product-price">
                        <span style={{ color: 'var(--text-primary)', fontWeight: 800 }}>
                            {formatINR(product.price)}
                        </span>
                        {hasDiscount && (
                            <span className="original-price">{formatINR(product.basePrice)}</span>
                        )}
                    </div>
                    {/* Hide the small cart button since we now have the big Quick Add overlay button */}
                    <div style={{ padding: '8px' }}></div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
