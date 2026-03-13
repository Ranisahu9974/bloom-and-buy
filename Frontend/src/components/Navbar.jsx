import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../utils/api';
import UserAvatar from './UserAvatar';
import {
    FiShoppingCart, FiUser, FiLogOut, FiShield,
    FiHome, FiPackage, FiStar, FiSearch, FiMenu, FiX, FiGrid, FiShoppingBag
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
    const { itemCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const isActive = (path) => location.pathname === path ? 'active' : '';

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
        setShowSuggestions(false);
    }, [location.pathname]);

    // Debounced search logic
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
            try {
                const { data } = await productsAPI.getAll({ search: searchQuery, limit: 5 });
                setSuggestions(data.products || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            }
        };

        const timerId = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(timerId);
    }, [searchQuery]);

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
        { to: '/membership', icon: <FiStar size={15} />, label: 'Membership' },
        ...(isAdmin ? [{ to: '/admin', icon: <FiShield size={15} />, label: 'Admin' }] : []),
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
                        {/* We hide the text because the new logo image already has "BLOOM AND BUY" text embedded, or we keep it if the logo image is just the icon. Let's conditionally show it or just rely on the new graphic which is stylish. */}
                        <span style={{ display: 'none' }}>Bloom <span style={{ color: 'var(--action-light)' }}>&</span> Buy</span>
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
                                    if (suggestions.length > 0) setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                            />
                        </form>

                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-dropdown">
                                {suggestions.map((product) => (
                                    <Link key={product._id} to={`/products/${product._id}`} className="search-dropdown-item">
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

                        {isAuthenticated ? (
                            <>
                                <Link to="/cart" className={`nav-link ${isActive('/cart')}`} style={{ position: 'relative' }}>
                                    <FiShoppingCart size={15} />
                                    <span>Cart</span>
                                    {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
                                </Link>
                                <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                                    <UserAvatar user={user} size={22} />
                                    <span>{user?.name?.split(' ')[0]}</span>
                                    {user?.membershipTier && (
                                        <span className={`tier-badge ${user.membershipTier.toLowerCase()}`}>
                                            {user.membershipTier}
                                        </span>
                                    )}
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
                {isAuthenticated ? (
                    <>
                        <Link to="/cart" className={`nav-link ${isActive('/cart')}`}>
                            <FiShoppingCart size={15} /><span>Cart {itemCount > 0 && `(${itemCount})`}</span>
                        </Link>
                        <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
                            <UserAvatar user={user} size={22} /><span>{user?.name}</span>
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
