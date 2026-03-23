import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiFacebook, FiYoutube, FiMail, FiArrowRight } from 'react-icons/fi';

const FooterLogo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img 
            src="/logo.png" 
            alt="Bloom & Buy Logo" 
            style={{ height: '55px', objectFit: 'contain', background: 'white', padding: '5px', borderRadius: '4px' }} 
        />
    </div>
);

const SOCIAL = [
    { icon: <FiTwitter size={16} />, label: 'Twitter', href: '#' },
    { icon: <FiInstagram size={16} />, label: 'Instagram', href: '#' },
    { icon: <FiFacebook size={16} />, label: 'Facebook', href: '#' },
    { icon: <FiYoutube size={16} />, label: 'YouTube', href: '#' },
];

const Footer = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email.trim()) { setSubscribed(true); setEmail(''); }
    };

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand col */}
                    <div>
                        <FooterLogo />
                        <p className="footer-desc" style={{ marginTop: '14px' }}>
                            Your trusted online shopping destination. Discover great deals and a seamless shopping experience.
                        </p>
                        {/* Social icons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                            {SOCIAL.map(s => (
                                <a key={s.label} href={s.href} aria-label={s.label} style={{
                                    width: 34, height: 34, borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#bbb', textDecoration: 'none', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,153,0,0.15)'; e.currentTarget.style.color = '#ff9900'; e.currentTarget.style.borderColor = 'rgba(255,153,0,0.3)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#bbb'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                >
                                    {s.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Shop links */}
                    <div>
                        <h4>Shop</h4>
                        <div className="footer-links">
                            <Link to="/products">All Products</Link>
                            <Link to="/products?category=Electronics">Electronics</Link>
                            <Link to="/products?category=Clothing">Clothing</Link>
                            <Link to="/products?category=Home%20%26%20Kitchen">Home &amp; Kitchen</Link>
                            <Link to="/products?clearance=true">Clearance Sale</Link>
                        </div>
                    </div>

                    {/* Account links */}
                    <div>
                        <h4>Account</h4>
                        <div className="footer-links">
                            <Link to="/profile">My Profile</Link>
                            <Link to="/orders">Order History</Link>
                            <Link to="/cart">Shopping Cart</Link>
                            <Link to="/register">Sign Up Free</Link>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4>Stay Updated</h4>
                        <p style={{ color: '#999', fontSize: '0.82rem', lineHeight: 1.5, marginBottom: '14px' }}>
                            Get exclusive deals and offers straight to your inbox.
                        </p>
                        {subscribed ? (
                            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#4ade80', fontSize: '0.82rem', fontWeight: 600 }}>
                                ✅ You're subscribed!
                            </div>
                        ) : (
                            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '6px' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', padding: '0 12px', gap: '8px' }}>
                                    <FiMail size={14} style={{ color: '#666' }} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        style={{ background: 'transparent', border: 'none', color: '#ddd', fontSize: '0.82rem', outline: 'none', width: '100%', padding: '10px 0' }}
                                    />
                                </div>
                                <button type="submit" style={{ background: '#ff9900', border: 'none', borderRadius: '8px', padding: '0 12px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <FiArrowRight size={16} />
                                </button>
                            </form>
                        )}

                        {/* Help links */}
                        <div style={{ marginTop: '18px' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#fff', marginBottom: '8px' }}>Support</div>
                            <div className="footer-links">
                                <a href="#">Help Center</a>
                                <a href="#">Shipping Info</a>
                                <a href="#">Returns &amp; Refunds</a>
                                <a href="#">Contact Us</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© {new Date().getFullYear()} Bloom and Buy. All rights reserved.</span>
                    <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
                    <a href="#" style={{ color: '#666', fontSize: '0.78rem' }}>Privacy Policy</a>
                    <span style={{ margin: '0 8px', opacity: 0.3 }}>·</span>
                    <a href="#" style={{ color: '#666', fontSize: '0.78rem' }}>Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
