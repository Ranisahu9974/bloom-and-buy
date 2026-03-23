import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import PremiumImage from '../components/PremiumImage';
import SkeletonCard from '../components/SkeletonCard';
import {
    FiArrowRight, FiShoppingBag, FiAward, FiTruck,
    FiPercent, FiChevronLeft, FiChevronRight, FiZap
} from 'react-icons/fi';

const SLIDES = [
    {
        title: 'Mega Sale — Up to 60% Off',
        sub: 'Electronics, fashion, home essentials & more. Limited time deals updated daily.',
        bg: 'linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 60%, #0d47a1 100%)',
        accent: '#4fc3f7',
        link: '/products',
        btn: 'Shop Now',
        badge: '🔥 Hot Deals',
        emoji: '⚡'
    },
    {
        title: 'New Arrivals This Week',
        sub: 'Fresh trends, latest gadgets, and curated picks just added to our collection.',
        bg: 'linear-gradient(135deg, #0d1b2a 0%, #1a1a3e 60%, #3949ab 100%)',
        accent: '#b39ddb',
        link: '/products?sort=newest',
        btn: 'Explore New',
        badge: '✨ Just In',
        emoji: '🆕'
    },

    {
        title: 'Home & Kitchen Picks',
        sub: 'Smart lamps, cozy blankets, premium cookware — transform your living space.',
        bg: 'linear-gradient(135deg, #0d1b2a 0%, #2d1b00 60%, #e65100 100%)',
        accent: '#ffcc80',
        link: '/products?category=Home%20%26%20Kitchen',
        btn: 'Shop Home',
        badge: '🏠 Home Deals',
        emoji: '🛋️'
    },
];

const CATEGORIES = [
    { name: 'Electronics', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop', icon: '💻' },
    { name: 'Clothing', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop', icon: '👗' },
    { name: 'Home & Kitchen', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop', icon: '🏠' },
    { name: 'Sports', img: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&h=200&fit=crop', icon: '⚽' },
    { name: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop', icon: '💄' },
    { name: 'Books', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=200&fit=crop', icon: '📚' },
];

const WHY_US = [
    { icon: <FiZap size={20} />, t: 'Dynamic Pricing', d: 'Prices update daily for best value' },
    { icon: <FiAward size={20} />, t: 'Earn Rewards', d: 'Cashback on every purchase made' },
    { icon: <FiTruck size={20} />, t: 'Fast Delivery', d: 'Real-time tracking with live ETA' },
    { icon: <FiPercent size={20} />, t: 'Smart Discounts', d: 'Member-only exclusive offers' },
];

const HomePage = () => {
    const [featured, setFeatured] = useState([]);
    const [deals, setDeals] = useState([]);
    const [stats, setStats] = useState([['...', 'Products'], ['...', 'Customers'], ['...', 'Rating']]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [slide, setSlide] = useState(0);
    const navigate = useNavigate();
    const s = SLIDES[slide];

    useEffect(() => {
        (async () => {
            try {
                const [f, d] = await Promise.all([
                    productsAPI.getAll({ limit: 12, sort: 'popular' }),
                    productsAPI.getAll({ limit: 8, sort: 'price_asc' })
                ]);
                // Filter out products with missing images
                const filterValid = (arr) => (arr || []).filter(p => p.imageURL && p.imageURL.trim() !== '');
                setFeatured(filterValid(f.data.products).slice(0, 8));
                setDeals(filterValid(d.data.products).slice(0, 4));

                productsAPI.getStats().then(s => {
                    setStats([
                        [s.data.products, 'Products'],
                        [s.data.customers, 'Customers'],
                        [s.data.rating, 'Rating']
                    ]);
                }).catch(e => console.error(e));

                // Load recently viewed from localStorage
                const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                setRecentlyViewed(viewed.slice(0, 4));
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    useEffect(() => {
        const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 6000);
        return () => clearInterval(t);
    }, []);

    return (
        <div>
            {/* ===== HERO BANNER ===== */}
            <section style={{
                background: s.bg,
                position: 'relative',
                overflow: 'hidden',
                minHeight: '480px',
                display: 'flex',
                alignItems: 'center',
                transition: 'background 0.8s ease'
            }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '400px', height: '400px', background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-60px', right: '15%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.02)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', top: '20%', right: '10%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

                <div className="container" style={{ position: 'relative', zIndex: 2, padding: '60px 24px' }}>
                    <div key={slide} style={{ maxWidth: '600px', animation: 'slideUp 0.4s ease' }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                            border: `1px solid ${s.accent}40`,
                            color: s.accent, borderRadius: '20px',
                            padding: '6px 14px', fontSize: '0.78rem', fontWeight: 700,
                            marginBottom: '20px', letterSpacing: '0.3px'
                        }}>
                            {s.badge}
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                            fontWeight: 900,
                            color: '#fff',
                            lineHeight: 1.15,
                            marginBottom: '16px',
                            letterSpacing: '-0.8px'
                        }}>
                            {s.title}
                        </h1>
                        <p style={{
                            fontSize: '1rem',
                            color: 'rgba(255,255,255,0.7)',
                            lineHeight: 1.6,
                            marginBottom: '32px',
                            maxWidth: '460px',
                        }}>
                            {s.sub}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <Link to={s.link} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
                                {s.btn} <FiArrowRight size={16} />
                            </Link>
                            <Link to="/products" className="btn" style={{
                                padding: '12px 28px', fontSize: '0.95rem',
                                background: 'rgba(255,255,255,0.1)', color: '#fff',
                                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                                backdropFilter: 'blur(10px)'
                            }}>
                                Browse All
                            </Link>
                        </div>

                        {/* Stats */}
                        <div style={{ display: 'flex', gap: '32px', marginTop: '40px', flexWrap: 'wrap' }}>
                            {stats.map(([v, l]) => (
                                <div key={l}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.accent }}>{v}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Arrows */}
                {[['left', 12, () => setSlide(p => (p - 1 + SLIDES.length) % SLIDES.length), <FiChevronLeft size={18} />],
                ['right', 12, () => setSlide(p => (p + 1) % SLIDES.length), <FiChevronRight size={18} />]
                ].map(([side, pos, fn, icon]) => (
                    <button key={side} onClick={fn}
                        style={{
                            position: 'absolute', [side]: pos, top: '50%', transform: 'translateY(-50%)',
                            width: 40, height: 40, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                            color: '#fff', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', zIndex: 3,
                            backdropFilter: 'blur(10px)', transition: 'all 0.2s'
                        }}>
                        {icon}
                    </button>
                ))}

                {/* Dots */}
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
                    {SLIDES.map((_, i) => (
                        <button key={i} onClick={() => setSlide(i)} style={{
                            width: i === slide ? 24 : 8, height: 8, borderRadius: 4,
                            background: i === slide ? s.accent : 'rgba(255,255,255,0.3)',
                            border: 'none', cursor: 'pointer', transition: 'all 0.35s'
                        }} />
                    ))}
                </div>
            </section>

            {/* ===== WHY SHOP WITH US ===== */}
            <section style={{ background: 'var(--bg-card)', padding: '0', borderBottom: '1px solid var(--border-light)' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {WHY_US.map((f, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '20px 24px',
                                borderRight: i < 3 ? '1px solid var(--border-light)' : 'none',
                            }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 10,
                                    background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
                                    border: '1px solid rgba(255,153,0,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#ff9900', flexShrink: 0
                                }}>{f.icon}</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: 2 }}>{f.t}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: 1.4 }}>{f.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SHOP BY CATEGORY ===== */}
            <section style={{ padding: '56px 0 0', background: 'var(--bg-primary)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.4px' }}>
                                Shop by Category
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Find exactly what you're looking for</p>
                        </div>
                        <Link to="/products" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ff9900', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            All Categories <FiArrowRight size={14} />
                        </Link>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '12px'
                    }}
                        className="category-grid"
                    >
                        {CATEGORIES.map((c, i) => (
                            <Link key={i} to={`/products?category=${encodeURIComponent(c.name)}`}
                                className="cat-card"
                                style={{ textDecoration: 'none', color: 'var(--text-primary)', background: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)', cursor: 'pointer', transition: 'all 0.25s ease', display: 'block' }}>
                                <div style={{ height: '110px', overflow: 'hidden', position: 'relative' }}>
                                    <PremiumImage
                                        src={c.img}
                                        alt={c.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
                                    <span style={{ position: 'absolute', bottom: '8px', left: '8px', fontSize: '1.4rem' }}>{c.icon}</span>
                                </div>
                                <div style={{ padding: '10px 12px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '-0.1px' }}>{c.name}</div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURED PRODUCTS ===== */}
            <section style={{ padding: '56px 0' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.4px' }}>
                                Featured Products
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Handpicked bestsellers you'll love</p>
                        </div>
                        <Link to="/products" className="btn btn-secondary btn-sm">
                            View All <FiArrowRight size={13} />
                        </Link>
                    </div>
                    {loading ? (
                        <div className="products-grid">
                            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : featured.length > 0 ? (
                        <div className="products-grid">
                            {featured.map(p => <ProductCard key={p._id} product={p} />)}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                            <p>No products available yet. <Link to="/products" style={{ color: '#ff9900' }}>Browse shop →</Link></p>
                        </div>
                    )}
                </div>
            </section>

            {/* ===== DEAL OF THE DAY ===== */}
            {!loading && deals.length > 0 && (
                <section style={{ padding: '0 0 56px' }}>
                    <div className="container">
                        <div style={{
                            background: 'linear-gradient(135deg, #fff8f0, #fff3e0)',
                            border: '1px solid rgba(255,153,0,0.25)',
                            borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '10px'
                        }}>
                            <span style={{ fontSize: '1.3rem' }}>⚡</span>
                            <div>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f1111' }}>Deal of the Day</span>
                                <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '8px' }}>Limited time — ends tonight</span>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <Link to="/products?sort=price_asc" style={{ fontSize: '0.82rem', color: '#ff9900', fontWeight: 600, textDecoration: 'none' }}>
                                    See All Deals →
                                </Link>
                            </div>
                        </div>
                        <div className="products-grid">
                            {deals.map(p => <ProductCard key={p._id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}


        </div>
    );
};

export default HomePage;
