import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../utils/api';
import UserAvatar from './UserAvatar';
import {
    FiShoppingCart, FiUser, FiLogOut, FiShield,
    FiHome, FiPackage, FiStar, FiSearch, FiMenu, FiX, FiGrid, FiShoppingBag, FiHeart, FiSun, FiMoon
} from 'react-icons/fi';

const Logo = () => (
    <img 
        src="/logo.png" 
        alt="Bloom & Buy Logo" 
        style={{ height: '40px', objectFit: 'contain', marginRight: '8px' }} 
    />
);

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, isSeller, logout } = useAuth();
    const { itemCount, openDrawer } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Apply Theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
        setShowSuggestions(false);
    }, [location.pathname]);

    // Debounced search logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length === 0) {
                try {
                    const { data } = await productsAPI.getRecommendations();
                    setSuggestions(Array.isArray(data) ? data.slice(0,5) : (data.products || []).slice(0,5));
                    // Only auto-show recommendations if the user is focused or clears search while focused
                    if (isFocused) setShowSuggestions(true);
                } catch (error) {
                    console.error('Failed to fetch recommendations:', error);
                }
                return;
            }
            try {
                const { data } = await productsAPI.getAll({ search: searchQuery, limit: 5 });
                setSuggestions(Array.isArray(data) ? data : (data.products || []));
                // Show suggestions because the user is actively typing
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        };

        const timerId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery, isFocused]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const navLinks = isAuthenticated ? [
        { to: '/', icon: <FiHome size={15} />, label: 'Home' },
        { to: '/products', icon: <FiGrid size={15} />, label: 'Shop' },
        { to: '/orders', icon: <FiPackage size={15} />, label: 'Orders' },
        ...(isAdmin ? [{ to: '/admin', icon: <FiShield size={15} />, label: 'Dashboard' }] : []),
        ...(isSeller ? [{ to: '/seller', icon: <FiShoppingBag size={15} />, label: 'Seller Panel' }] : []),
    ] : [
        { to: '/', icon: <FiHome size={15} />, label: 'Home' },
        { to: '/products', icon: <FiGrid size={15} />, label: 'Shop' },
    ];

    return (
        <>
            <nav className="navbar">
                <div className="navbar-inner">
                    {/* Logo wrapper */}
                    <Link to="/" className="navbar-brand">
                        <Logo />
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Bloom <span style={{ color: '#ff9900' }}>&</span> Buy</span>
                    </Link>

                    {/* Search bar */}
                    <div style={{ flex: 1, maxWidth: '480px', position: 'relative' }}>
                        <form className="navbar-search" onSubmit={handleSearch} style={{ maxWidth: '100%' }}>
                            <FiSearch size={16} className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search products, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => {
                                    setIsFocused(true);
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setIsFocused(false);
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                            />
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-dropdown">
                                {suggestions.map((product) => (
                                    <Link key={product.id || product._id} to={`/products/${product.id || product._id}`} className="search-dropdown-item">
                                        <div className="search-dropdown-img">
                                            {product.imageURL ? (
                                                <img src={product.imageURL} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            ) : (
                                                <FiPackage size={16} color="var(--text-muted)" />
                                            )}
                                        </div>
                                        <div className="search-dropdown-info">
                                            <span className="search-dropdown-name">{product.name}</span>
                                            <span className="search-dropdown-price" style={{ color: 'var(--action)' }}>₹{product.price}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop nav */}
                    <div className="navbar-nav">
                        {navLinks.map(l => (
                            <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to)}`}>
                                {l.icon}<span>{l.label}</span>
                            </Link>
                        ))}

                        <button className="nav-link" onClick={toggleTheme} title="Toggle Theme" style={{ background: 'transparent', border: 'none' }}>
                            {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
                        </button>

                        {isAuthenticated ? (
                            <>
                                <Link to="/wishlist" className={`nav-link ${isActive('/wishlist')}`}>
                                    <FiHeart size={15} /><span>Wishlist</span>
                                </Link>
                                <button className={`nav-link ${isActive('/cart')}`} onClick={openDrawer} style={{ position: 'relative', background: 'transparent', border: 'none' }}>
                                    <FiShoppingCart size={15} />
                                    <span>Cart</span>
                                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                                </button>
                                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                                    <UserAvatar user={user} size={22} />
                                    <span>{isAdmin ? 'Dashboard' : user?.name?.split(' ')[0]}</span>
                                </Link>
                                <button className="nav-link" onClick={logout} title="Logout">
                                    <FiLogOut size={15} />
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="nav-link" style={{ fontWeight: 400 }}>Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm" style={{ marginLeft: '4px' }}>Sign Up</Link>
                            </>
                        )}
                    </div>

                    {/* Hamburger */}
                    <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
                        {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </nav>

            {/* Mobile menu */}
            <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
                {/* Mobile search */}
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <div className="navbar-search" style={{ flex: 1, maxWidth: '100%' }}>
                        <FiSearch size={16} className="navbar-search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm">Go</button>
                </form>

                {navLinks.map(l => (
                    <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to)}`}>
                        {l.icon}<span>{l.label}</span>
                    </Link>
                ))}
                
                <button className="nav-link" onClick={toggleTheme} style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none' }}>
                    {theme === 'light' ? <FiMoon size={15} /> : <FiSun size={15} />}<span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                {isAuthenticated ? (
                    <>
                        <button className={`nav-link ${isActive('/cart')}`} onClick={() => { openDrawer(); setMenuOpen(false); }} style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none' }}>
                            <FiShoppingCart size={15} /><span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                        </button>
                        <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                            <UserAvatar user={user} size={22} /><span>{isAdmin ? 'Dashboard' : user?.name}</span>
                        </Link>
                        <button className="nav-link" onClick={logout} style={{ width: '100%', justifyContent: 'flex-start' }}>
                            <FiLogOut size={15} /><span>Logout</span>
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link"><span>Login</span></Link>
                        <Link to="/register" className="btn btn-primary btn-sm" style={{ textAlign: 'center' }}>Sign Up</Link>
                    </>
                )}
            </div>
        </>
    );
};

export default Navbar;
