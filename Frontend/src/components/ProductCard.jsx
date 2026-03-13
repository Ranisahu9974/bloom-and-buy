import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';
import PremiumImage from './PremiumImage';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }
        try {
            await addToCart(product._id);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add to cart');
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
    const isOutOfStock = product.stockQuantity === 0;

    return (
        <div
            className="product-card"
            onClick={() => navigate(`/products/${product._id}`)}
            style={{ position: 'relative' }}
        >
            <div className="product-card-image">
                <PremiumImage
                    src={product.imageURL}
                    alt={product.name}
                />

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
                        <span style={{ color: '#0f1111', fontWeight: 700 }}>
                            {formatINR(product.price)}
                        </span>
                        {hasDiscount && (
                            <span className="original-price">{formatINR(product.basePrice)}</span>
                        )}
                    </div>
                    <button
                        className="add-to-cart-btn"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                        title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
                    >
                        <FiShoppingCart size={17} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
