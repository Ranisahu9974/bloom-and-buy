import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

const NotFoundPage = () => (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 24px' }}>
        <div>
            <div style={{ fontSize: '6rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, marginBottom: '16px' }}>404</div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>Page Not Found</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px' }}>
                Oops! The page you're looking for doesn't exist or has been moved.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/" className="btn btn-primary"><FiHome size={16} /> Go Home</Link>
                <Link to="/products" className="btn btn-secondary"><FiShoppingBag size={16} /> Browse Products</Link>
            </div>
        </div>
    </div>
);

export default NotFoundPage;
