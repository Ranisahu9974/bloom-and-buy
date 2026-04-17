import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiPackage, FiTruck, FiEye, FiShoppingBag } from 'react-icons/fi';
import { formatINR } from '../utils/currency';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const fetchOrders = async () => {
        try {
            const { data } = await ordersAPI.getAll(page);
            const ordersList = Array.isArray(data) ? data : (data.orders || data.results || []);
            setOrders(ordersList);
            if (data.pagination) {
                setTotalPages(data.pagination.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (status) => {
        return (status || '').toLowerCase().replace(/\s+/g, '-');
    };

    if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;

    return (
        <div className="main-content">
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="page-header">
                    <h1 className="page-title">My Orders</h1>
                    <p className="page-subtitle">Track and manage your orders</p>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here!</p>
                        <Link to="/products" className="btn btn-primary">
                            <FiShoppingBag /> Browse Products
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {orders.map(order => (
                            <div key={order._id} className="glass-card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            Order #{String(order.id || order._id || '').slice(-8).toUpperCase()}
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '1.2rem', marginBottom: '4px' }}>
                                            {formatINR(order.total_price || order.totalAmount)}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {new Date(order.created_at || order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span className={`status-tag ${getStatusClass(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                                    {(order.items || []).slice(0, 4).map((item, idx) => (
                                        <div key={idx} style={{
                                            width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                                            overflow: 'hidden', border: '1px solid var(--border)'
                                        }}>
                                            <img src={item.imageURL || 'https://placehold.co/48x48/1e1e35/6366f1?text=·'}
                                                alt={item.product_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => { e.target.src = 'https://placehold.co/48x48/1e1e35/6366f1?text=·'; }}
                                            />
                                        </div>
                                    ))}
                                    {(order.items || []).length > 4 && (
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'var(--bg-input)', border: '1px solid var(--border)',
                                            fontSize: '0.75rem', color: 'var(--text-muted)'
                                        }}>+{order.items.length - 4}</div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                    <Link to={`/orders/tracking/${order.id || order._id}`} className="btn btn-secondary btn-sm">
                                        <FiTruck size={14} /> Track Order
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button disabled={page <= 1}
                                    onClick={() => setPage(p => p - 1)}>
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button key={i + 1} className={page === i + 1 ? 'active' : ''}
                                        onClick={() => setPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button disabled={page >= totalPages}
                                    onClick={() => setPage(p => p + 1)}>
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
