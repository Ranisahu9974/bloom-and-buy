import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiDollarSign, FiShoppingBag, FiUsers, FiPackage, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { formatINR } from '../utils/currency';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState('');

    useEffect(() => {
        if (activeTab === 'overview') fetchSummary();
        else if (activeTab === 'orders') fetchOrders();
        else if (activeTab === 'inventory') fetchInventory();
    }, [activeTab, orderFilter, inventoryFilter]);

    const fetchSummary = async () => {
        setLoading(true);
        try {
            const { data } = await adminAPI.getSummary();
            setSummary(data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {};
            if (orderFilter) params.status = orderFilter;
            const { data } = await adminAPI.getOrders(params);
            setOrders(data.orders || []);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const params = {};
            if (inventoryFilter === 'lowstock') params.lowstock = 'true';
            if (inventoryFilter === 'deadstock') params.deadstock = 'true';
            const { data } = await adminAPI.getInventory(params);
            setInventory(data.products || []);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await adminAPI.updateOrderStatus(orderId, { status });
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    const getStatusClass = (status) => {
        return (status || '').toLowerCase().replace(/\s+/g, '-');
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: <FiShoppingBag /> },
        { id: 'orders', label: 'Orders', icon: <FiPackage /> },
        { id: 'inventory', label: 'Inventory', icon: <FiAlertTriangle /> }
    ];

    return (
        <div className="main-content">
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="page-title">Admin Dashboard</h1>
                        <p className="page-subtitle">Manage your e-commerce platform</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                    {tabs.map(tab => (
                        <button key={tab.id}
                            className={`btn btn-ghost ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : 'none',
                                borderRadius: '8px 8px 0 0',
                                color: activeTab === tab.id ? 'var(--primary-light)' : 'var(--text-muted)'
                            }}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-spinner"><div className="spinner" /></div>
                ) : (
                    <>
                        {/* ===== Overview Tab ===== */}
                        {activeTab === 'overview' && summary && (
                            <div>
                                {/* Stats */}
                                <div className="stats-grid">
                                    <div className="stat-card revenue">
                                        <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
                                            <FiDollarSign />
                                        </div>
                                        <div className="stat-value">{formatINR(summary.totalRevenue)}</div>
                                        <div className="stat-label">Total Revenue</div>
                                    </div>
                                    <div className="stat-card orders">
                                        <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-light)' }}>
                                            <FiShoppingBag />
                                        </div>
                                        <div className="stat-value">{summary.totalOrders || 0}</div>
                                        <div className="stat-label">Total Orders</div>
                                    </div>
                                    <div className="stat-card users">
                                        <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)' }}>
                                            <FiUsers />
                                        </div>
                                        <div className="stat-value">{summary.totalUsers || 0}</div>
                                        <div className="stat-label">Total Users</div>
                                    </div>
                                    <div className="stat-card products">
                                        <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--info)' }}>
                                            <FiPackage />
                                        </div>
                                        <div className="stat-value">{summary.totalProducts || 0}</div>
                                        <div className="stat-label">Active Products</div>
                                    </div>
                                </div>

                                {/* Orders by Status & Membership Distribution */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                    <div className="glass-card" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Orders by Status</h3>
                                        {(summary.ordersByStatus || []).length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders yet</p>
                                        ) : (summary.ordersByStatus || []).map(item => (
                                            <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                <span className={`status-tag ${getStatusClass(item._id)}`}>{item._id}</span>
                                                <span style={{ fontWeight: '600' }}>{item.count}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="glass-card" style={{ padding: '24px' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Membership Distribution</h3>
                                        {(summary.membershipDist || []).map(item => {
                                            const colors = { Gold: 'var(--accent)', Silver: '#94a3b8', Basic: 'var(--primary-light)' };
                                            return (
                                                <div key={item._id} style={{ marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.9rem' }}>
                                                        <span className={`tier-badge ${(item._id || '').toLowerCase()}`}>{item._id}</span>
                                                        <span style={{ fontWeight: '600' }}>{item.count} users</span>
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{
                                                            width: `${(item.count / (summary.totalUsers || 1)) * 100}%`,
                                                            background: colors[item._id] || 'var(--primary)'
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Top Products */}
                                {(summary.topProducts || []).length > 0 && (
                                    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Top Selling Products</h3>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Units Sold</th>
                                                    <th>Revenue</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {summary.topProducts.map((p, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: '600' }}>{p._id}</td>
                                                        <td>{p.totalSold}</td>
                                                        <td style={{ color: 'var(--success)', fontWeight: '600' }}>{formatINR(p.revenue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Alerts */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {(summary.lowStock || []).length > 0 && (
                                        <div className="glass-card" style={{ padding: '24px' }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FiAlertTriangle /> Low Stock Alerts
                                            </h3>
                                            {summary.lowStock.map(p => (
                                                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                                    <span>{p.name}</span>
                                                    <span style={{ color: 'var(--error)', fontWeight: '600' }}>{p.stockQuantity} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {(summary.nearExpiry || []).length > 0 && (
                                        <div className="glass-card" style={{ padding: '24px' }}>
                                            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FiAlertTriangle /> Expiring Soon
                                            </h3>
                                            {summary.nearExpiry.map(p => (
                                                <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
                                                    <span>{p.name}</span>
                                                    <span style={{ color: 'var(--accent)' }}>
                                                        {new Date(p.expiryDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ===== Orders Tab ===== */}
                        {activeTab === 'orders' && (
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                    {['', 'Confirmed', 'Packed', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'].map(filter => (
                                        <button key={filter}
                                            className={`btn btn-sm ${orderFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setOrderFilter(filter)}>
                                            {filter || 'All'}
                                        </button>
                                    ))}
                                </div>

                                {orders.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '40px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No orders found</p>
                                    </div>
                                ) : (
                                    <div className="glass-card" style={{ overflow: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order._id}>
                                                        <td style={{ fontWeight: '600', fontSize: '0.8rem' }}>
                                                            #{order._id?.slice(-8).toUpperCase()}
                                                        </td>
                                                        <td>
                                                            <div>{order.user?.name || 'Unknown'}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                {order.user?.email || ''}
                                                            </div>
                                                        </td>
                                                        <td style={{ fontWeight: '600' }}>{formatINR(order.totalAmount)}</td>
                                                        <td>
                                                            <span className={`status-tag ${getStatusClass(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                            {order.slaBreached && (
                                                                <span style={{ marginLeft: '4px', color: 'var(--error)', fontSize: '0.7rem' }}>⚠️ SLA</span>
                                                            )}
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-select"
                                                                value={order.status}
                                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                                style={{ fontSize: '0.8rem', padding: '6px 10px', minWidth: '140px' }}>
                                                                {['Confirmed', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ===== Inventory Tab ===== */}
                        {activeTab === 'inventory' && (
                            <div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                                    {[
                                        { value: '', label: 'All' },
                                        { value: 'lowstock', label: 'Low Stock' },
                                        { value: 'deadstock', label: 'Dead Stock' }
                                    ].map(filter => (
                                        <button key={filter.value}
                                            className={`btn btn-sm ${inventoryFilter === filter.value ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setInventoryFilter(filter.value)}>
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>

                                {inventory.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '40px' }}>
                                        <p style={{ color: 'var(--text-muted)' }}>No products match the current filter</p>
                                    </div>
                                ) : (
                                    <div className="glass-card" style={{ overflow: 'auto' }}>
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>30-Day Sales</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.map(product => (
                                                    <tr key={product._id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <img src={product.imageURL || 'https://placehold.co/40x40/1e1e35/6366f1?text=·'}
                                                                    alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                                                                    onError={(e) => { e.target.src = 'https://placehold.co/40x40/1e1e35/6366f1?text=·'; }}
                                                                />
                                                                <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ fontSize: '0.8rem' }}>{product.category}</td>
                                                        <td style={{ fontWeight: '600' }}>{formatINR(product.price)}</td>
                                                        <td>
                                                            <span style={{
                                                                fontWeight: '700',
                                                                color: product.stockQuantity <= (product.lowStockThreshold || 10)
                                                                    ? 'var(--error)' : 'var(--text-primary)'
                                                            }}>
                                                                {product.stockQuantity}
                                                            </span>
                                                        </td>
                                                        <td>{product.salesLast30Days || 0}</td>
                                                        <td>
                                                            {product.stockQuantity <= (product.lowStockThreshold || 10) && (
                                                                <span className="badge badge-near-expiry">Low</span>
                                                            )}
                                                            {product.salesLast30Days === 0 && product.stockQuantity > 10 && (
                                                                <span className="badge badge-clearance">Dead Stock</span>
                                                            )}
                                                            {product.isClearance && (
                                                                <span className="badge badge-clearance">Clearance</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
