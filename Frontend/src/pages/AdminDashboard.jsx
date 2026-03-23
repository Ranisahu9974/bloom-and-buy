import { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
    FiDollarSign, FiShoppingBag, FiUsers, FiPackage, 
    FiAlertTriangle, FiRefreshCw, FiCheckCircle, 
    FiXCircle, FiGrid, FiTrendingUp, FiBarChart2, 
    FiLayers, FiSettings, FiUserCheck, FiTruck,
    FiFilter, FiSearch, FiMoreVertical, FiEye, 
    FiBell, FiCalendar, FiArrowLeft, FiArrowRight, FiInbox
} from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [summary, setSummary] = useState(null);
    const [orders, setOrders] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [pendingProducts, setPendingProducts] = useState([]);
    const [moderationPagination, setModerationPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
    const [moderationFilters, setModerationFilters] = useState({ status: 'pending', category: '', search: '', seller: '' });
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [bulkSelection, setBulkSelection] = useState([]);
    const [users, setUsers] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderFilter, setOrderFilter] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ price: '', stockQuantity: '' });

    useEffect(() => {
        fetchData();
    }, [activeTab, orderFilter, inventoryFilter, moderationFilters, moderationPagination.page]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await adminAPI.getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const { data } = await adminAPI.getSummary();
                setSummary(data);
            } else if (activeTab === 'orders') {
                const params = {};
                if (orderFilter) params.status = orderFilter;
                const { data } = await adminAPI.getOrders(params);
                setOrders(data.orders || []);
            } else if (activeTab === 'inventory') {
                const params = {};
                if (inventoryFilter === 'lowstock') params.lowstock = 'true';
                if (inventoryFilter === 'deadstock') params.deadstock = 'true';
                const { data } = await adminAPI.getInventory(params);
                setInventory(data.products || []);
            } else if (activeTab === 'moderation') {
                const params = {
                    ...moderationFilters,
                    page: moderationPagination.page,
                    limit: moderationPagination.limit
                };
                const { data } = await adminAPI.getModerationProducts(params);
                setPendingProducts(data.products || []);
                setModerationPagination(data.pagination);
            } else if (activeTab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users || []);
            } else if (activeTab === 'sellers') {
                const { data } = await adminAPI.getSellers();
                setSellers(data.sellers || []);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error(`Failed to load ${activeTab} data`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateInventory = async (id) => {
        try {
            await adminAPI.overrideProduct(id, {
                price: parseFloat(editForm.price),
                stockQuantity: parseInt(editForm.stockQuantity),
                imageURL: editForm.imageURL
            });
            toast.success('Product updated by override');
            setEditingId(null);
            fetchData();
        } catch (error) {
            toast.error('Failed to update product');
        }
    };

    const startEditing = (product) => {
        setEditingId(product._id);
        setEditForm({ 
            price: product.price, 
            stockQuantity: product.stockQuantity,
            imageURL: product.imageURL 
        });
    };

    const handleModerate = async (id, status, reason = '') => {
        try {
            await adminAPI.moderateProduct(id, { approvalStatus: status, rejectionReason: reason });
            toast.success(`Product ${status} successfully`);
            setSelectedProduct(null);
            setRejectionReason('');
            fetchData();
        } catch (error) {
            toast.error(`Failed to ${status} product`);
        }
    };

    const handleBulkModerate = async (status) => {
        if (bulkSelection.length === 0) return;
        try {
            await adminAPI.bulkModerateProducts({ productIds: bulkSelection, approvalStatus: status });
            toast.success(`Bulk ${status} successful`);
            setBulkSelection([]);
            fetchData();
        } catch (error) {
            toast.error(`Bulk ${status} failed`);
        }
    };

    const markNotificationRead = async (id) => {
        try {
            await adminAPI.markNotificationRead(id);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification read');
        }
    };

    const toggleSellerStatus = async (id) => {
        try {
            await adminAPI.toggleSeller(id);
            toast.success('Seller status updated');
            fetchData();
        } catch (error) {
            toast.error('Failed to update seller status');
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            await adminAPI.updateOrderStatus(orderId, { status });
            toast.success(`Order status updated to ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update order');
        }
    };

    const getStatusClass = (status) => {
        return (status || '').toLowerCase().replace(/\s+/g, '-');
    };

    const sidebarItems = [
        { id: 'overview', label: 'Overview', icon: <FiGrid /> },
        { id: 'orders', label: 'Orders', icon: <FiTruck /> },
        { id: 'inventory', label: 'Inventory', icon: <FiLayers /> },
        { id: 'moderation', label: 'Moderation', icon: <FiCheckCircle /> },
        { id: 'users', label: 'Users', icon: <FiUsers /> },
        { id: 'sellers', label: 'Sellers', icon: <FiUserCheck /> }
    ];

    const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

    return (
        <div className="main-content">
            <div className="dashboard-container">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                            Bloom & Buy Dashboard
                        </h2>
                        <div style={{ position: 'relative' }}>
                            <button 
                                className="btn btn-ghost" 
                                style={{ padding: '8px', borderRadius: '50%', position: 'relative' }}
                                onClick={() => setShowNotifications(!showNotifications)}
                            >
                                <FiBell size={20} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span style={{ 
                                        position: 'absolute', top: '4px', right: '4px', 
                                        background: 'var(--error)', width: '8px', height: '8px', 
                                        borderRadius: '50%', border: '2px solid white' 
                                    }} />
                                )}
                            </button>
                            
                            {showNotifications && (
                                <div className="glass-card" style={{ 
                                    position: 'absolute', top: '40px', left: '0', zIndex: 100,
                                    width: '300px', maxHeight: '400px', overflowY: 'auto',
                                    boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)'
                                }}>
                                    <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                                        Notifications
                                        <button className="btn btn-ghost btn-sm" onClick={() => setShowNotifications(false)}><FiXCircle /></button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div 
                                                key={n._id} 
                                                onClick={() => markNotificationRead(n._id)}
                                                style={{ 
                                                    padding: '12px', borderBottom: '1px solid var(--border-light)', 
                                                    cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{n.message}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {new Date(n.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <nav className="sidebar-nav">
                        {sidebarItems.map(item => (
                            <button 
                                key={item.id}
                                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                    <div style={{ padding: '24px', borderTop: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--action)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                A
                            </div>
                            <div>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>Admin User</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>Super Admin</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="dashboard-main">
                    <div className="page-header sticky-header">
                        <h1 className="page-title">{sidebarItems.find(i => i.id === activeTab)?.label} Dashboard</h1>
                        <p className="page-subtitle">Platform control and performance analytics</p>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <>
                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && summary && (
                                <div className="fade-in">
                                    <div className="analytics-grid">
                                        <div className="glass-card analytics-card">
                                            <div className="analytics-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
                                                <FiDollarSign />
                                            </div>
                                            <div className="analytics-value">{formatINR(summary.totalRevenue)}</div>
                                            <div className="analytics-label">Total Revenue</div>
                                            <div className="analytics-trend trend-up">
                                                <FiTrendingUp /> 12.5% increase
                                            </div>
                                        </div>
                                        <div className="glass-card analytics-card">
                                            <div className="analytics-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                                                <FiShoppingBag />
                                            </div>
                                            <div className="analytics-value">{summary.totalOrders}</div>
                                            <div className="analytics-label">Total Orders</div>
                                            <div className="analytics-trend trend-up">
                                                <FiTrendingUp /> 8.2% vs last month
                                            </div>
                                        </div>
                                        <div className="glass-card analytics-card">
                                            <div className="analytics-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                                                <FiUsers />
                                            </div>
                                            <div className="analytics-value">{summary.totalUsers}</div>
                                            <div className="analytics-label">Active Users</div>
                                            <div className="analytics-trend trend-up">
                                                <FiTrendingUp /> 24 new today
                                            </div>
                                        </div>
                                        <div className="glass-card analytics-card">
                                            <div className="analytics-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
                                                <FiPackage />
                                            </div>
                                            <div className="analytics-value">{summary.totalProducts}</div>
                                            <div className="analytics-label">Total Products</div>
                                            <div className="analytics-trend"> Stable inventory </div>
                                        </div>
                                    </div>

                                    <div className="charts-grid">
                                        <div className="glass-card chart-card">
                                            <div className="chart-header">
                                                <h3 className="chart-title">Revenue Trends (Last 7 Days)</h3>
                                            </div>
                                            <div className="chart-container">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={summary.recentRevenue}>
                                                        <defs>
                                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                        <XAxis 
                                                            dataKey="_id" 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 10, fill: '#64748b' }} 
                                                            dy={10}
                                                        />
                                                        <YAxis 
                                                            axisLine={false} 
                                                            tickLine={false} 
                                                            tick={{ fontSize: 10, fill: '#64748b' }}
                                                            tickFormatter={(val) => `\u20B9${val/1000}k`}
                                                        />
                                                        <Tooltip 
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                            formatter={(val) => [formatINR(val), 'Revenue']}
                                                        />
                                                        <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>


                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div className="glass-card" style={{ padding: '24px' }}>
                                            <h3 className="chart-title" style={{ marginBottom: '16px' }}>Top Performing Products</h3>
                                            <div className="table-container">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Sales</th>
                                                            <th>Revenue</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {summary.topProducts.map((p, i) => (
                                                            <tr key={i}>
                                                                <td style={{ fontWeight: 600 }}>{p._id}</td>
                                                                <td>{p.totalSold}</td>
                                                                <td style={{ color: 'var(--success)', fontWeight: 700 }}>{formatINR(p.revenue)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <div className="glass-card" style={{ padding: '24px' }}>
                                            <h3 className="chart-title" style={{ marginBottom: '16px', color: 'var(--error)' }}>Critical Inventory Alerts</h3>
                                            <div className="table-container">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Product</th>
                                                            <th>Stock</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {summary.lowStock.slice(0, 5).map((p, i) => (
                                                            <tr key={i}>
                                                                <td>{p.name}</td>
                                                                <td style={{ fontWeight: 700, color: 'var(--error)' }}>{p.stockQuantity}</td>
                                                                <td><span className="badge badge-clearance">Low Stock</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ORDERS TAB */}
                            {activeTab === 'orders' && (
                                <div className="fade-in">
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                                        {['', 'Confirmed', 'Packed', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'].map(filter => (
                                            <button key={filter}
                                                className={`btn ${orderFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setOrderFilter(filter)}
                                                style={{ whiteSpace: 'nowrap' }}>
                                                {filter || 'All Orders'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Customer</th>
                                                    <th>Total</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order._id}>
                                                        <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-muted)' }}>
                                                            #{order._id.slice(-8).toUpperCase()}
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{order.user?.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                                                        </td>
                                                        <td style={{ fontWeight: 700 }}>{formatINR(order.totalAmount)}</td>
                                                        <td>
                                                            <span className={`status-tag ${getStatusClass(order.status)}`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <select 
                                                                className="form-select" 
                                                                value={order.status}
                                                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                                style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                                                            >
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
                                </div>
                            )}

                            {/* INVENTORY TAB */}
                            {activeTab === 'inventory' && (
                                <div className="fade-in">
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                        <button className={`btn ${inventoryFilter === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInventoryFilter('')}>All Inventory</button>
                                        <button className={`btn ${inventoryFilter === 'lowstock' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInventoryFilter('lowstock')}>Low Stock</button>
                                        <button className={`btn ${inventoryFilter === 'deadstock' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setInventoryFilter('deadstock')}>Dead Stock</button>
                                    </div>
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Product Info</th>
                                                    <th>Image URL</th>
                                                    <th>Category</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>Sales (30d)</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.map(product => (
                                                    <tr key={product._id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <img src={product.imageURL} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                                <span style={{ fontWeight: 600 }}>{product.name}</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ maxWidth: '200px' }}>
                                                            {editingId === product._id ? (
                                                                <input 
                                                                    type="text" 
                                                                    className="form-input" 
                                                                    value={editForm.imageURL} 
                                                                    onChange={e => setEditForm({...editForm, imageURL: e.target.value})}
                                                                    style={{ width: '100%', padding: '4px', fontSize: '0.8rem' }}
                                                                    placeholder="Image URL"
                                                                />
                                                            ) : (
                                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={product.imageURL}>
                                                                    {product.imageURL}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{product.category}</td>
                                                        <td>
                                                            {editingId === product._id ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="form-input" 
                                                                    value={editForm.price} 
                                                                    onChange={e => setEditForm({...editForm, price: e.target.value})}
                                                                    style={{ width: '100px', padding: '4px' }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontWeight: 700 }}>{formatINR(product.price)}</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {editingId === product._id ? (
                                                                <input 
                                                                    type="number" 
                                                                    className="form-input" 
                                                                    value={editForm.stockQuantity} 
                                                                    onChange={e => setEditForm({...editForm, stockQuantity: e.target.value})}
                                                                    style={{ width: '80px', padding: '4px' }}
                                                                />
                                                            ) : (
                                                                <span style={{ fontWeight: 700, color: product.stockQuantity <= 10 ? 'var(--error)' : 'inherit' }}>
                                                                    {product.stockQuantity}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{product.salesLast30Days || 0}</td>
                                                        <td>
                                                            {editingId === product._id ? (
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleUpdateInventory(product._id)}>Save</button>
                                                                    <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                                                </div>
                                                            ) : (
                                                                <button className="btn btn-sm btn-primary" onClick={() => startEditing(product)}>Edit</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>

                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* MODERATION TAB */}
                            {activeTab === 'moderation' && (
                                <div className="fade-in">
                                    {/* Filters & Actions Bar */}
                                    <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
                                            <div style={{ position: 'relative', flex: 1 }}>
                                                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                                <input 
                                                    type="text" 
                                                    className="form-input" 
                                                    placeholder="Search products..." 
                                                    style={{ paddingLeft: '40px' }}
                                                    value={moderationFilters.search}
                                                    onChange={(e) => setModerationFilters({ ...moderationFilters, search: e.target.value })}
                                                />
                                            </div>
                                            <select 
                                                className="form-select" 
                                                style={{ width: '150px' }}
                                                value={moderationFilters.status}
                                                onChange={(e) => setModerationFilters({ ...moderationFilters, status: e.target.value })}
                                            >
                                                <option value="">All Status</option>
                                                <option value="pending">Pending</option>
                                                <option value="approved">Approved</option>
                                                <option value="rejected">Rejected</option>
                                            </select>
                                            <select 
                                                className="form-select" 
                                                style={{ width: '150px' }}
                                                value={moderationFilters.category}
                                                onChange={(e) => setModerationFilters({ ...moderationFilters, category: e.target.value })}
                                            >
                                                <option value="">All Categories</option>
                                                {['Electronics', 'Fashion', 'Home', 'Beauty', 'Books'].map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {bulkSelection.length > 0 && (
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '12px', paddingRight: '12px', borderRight: '1px solid var(--border)' }}>
                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{bulkSelection.length} selected</span>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleBulkModerate('approved')}>Approve All</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleBulkModerate('rejected')}>Reject All</button>
                                                </div>
                                            )}
                                            <button className="btn btn-secondary" onClick={() => { setModerationFilters({ status: 'pending', category: '', search: '', seller: '' }); setBulkSelection([]); }}>
                                                <FiRefreshCw /> Reset
                                            </button>
                                        </div>
                                    </div>

                                    {/* Products Table */}
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '40px' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={bulkSelection.length === pendingProducts.length && pendingProducts.length > 0}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setBulkSelection(pendingProducts.map(p => p._id));
                                                                else setBulkSelection([]);
                                                            }}
                                                        />
                                                    </th>
                                                    <th>Product</th>
                                                    <th>Seller</th>
                                                    <th>Price</th>
                                                    <th>Status</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="7" style={{ textAlign: 'center', padding: '60px' }}>
                                                            <FiInbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                                                            <p style={{ color: 'var(--text-muted)' }}>No products found matching filters</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    pendingProducts.map(product => (
                                                        <tr key={product._id} className={bulkSelection.includes(product._id) ? 'selected-row' : ''}>
                                                            <td>
                                                                <input 
                                                                    type="checkbox" 
                                                                    checked={bulkSelection.includes(product._id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) setBulkSelection([...bulkSelection, product._id]);
                                                                        else setBulkSelection(bulkSelection.filter(id => id !== product._id));
                                                                    }}
                                                                />
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                    <div style={{ position: 'relative' }}>
                                                                        <img src={product.imageURL || 'https://placehold.co/40x40?text=P'} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                                                        {!product.imageURL && (
                                                                            <FiAlertTriangle style={{ position: 'absolute', bottom: '-4px', right: '-4px', color: 'var(--error)', background: 'white', borderRadius: '50%' }} size={14} title="Missing Image" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div style={{ fontWeight: 600 }}>{product.name}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.category}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <img src={product.seller?.storeLogo || 'https://placehold.co/24x24?text=S'} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                                                    <span style={{ fontSize: '0.85rem' }}>{product.seller?.storeName || 'Unknown'}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ fontWeight: 700 }}>{formatINR(product.price)}</td>
                                                            <td>
                                                                <span className={`status-tag ${product.approvalStatus}`}>
                                                                    {product.approvalStatus}
                                                                </span>
                                                            </td>
                                                            <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedProduct(product)} title="View Details">
                                                                        <FiEye size={18} />
                                                                    </button>
                                                                    {product.approvalStatus === 'pending' && (
                                                                        <>
                                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => handleModerate(product._id, 'approved')} title="Approve">
                                                                                <FiCheckCircle size={18} />
                                                                            </button>
                                                                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => setSelectedProduct(product)} title="Reject">
                                                                                <FiXCircle size={18} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Showing {pendingProducts.length} of {moderationPagination.total} products
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                className="btn btn-secondary btn-sm" 
                                                disabled={moderationPagination.page === 1}
                                                onClick={() => setModerationPagination({ ...moderationPagination, page: moderationPagination.page - 1 })}
                                            >
                                                <FiArrowLeft /> Previous
                                            </button>
                                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontWeight: 600 }}>
                                                Page {moderationPagination.page} of {moderationPagination.pages}
                                            </div>
                                            <button 
                                                className="btn btn-secondary btn-sm" 
                                                disabled={moderationPagination.page === moderationPagination.pages}
                                                onClick={() => setModerationPagination({ ...moderationPagination, page: moderationPagination.page + 1 })}
                                            >
                                                Next <FiArrowRight />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="fade-in">
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>User</th>
                                                    <th>Joined</th>
                                                    <th>Spent</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(user => (
                                                    <tr key={user._id}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                        </td>
                                                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                                        <td style={{ fontWeight: 700 }}>{formatINR(user.totalSpent)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* SELLERS TAB */}
                            {activeTab === 'sellers' && (
                                <div className="fade-in">
                                    <div className="table-container">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Store</th>
                                                    <th>Owner</th>
                                                    <th>Products</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sellers.map(seller => (
                                                    <tr key={seller._id}>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <img src={seller.storeLogo || 'https://placehold.co/40x40/1e1e35/6366f1?text=S'} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                                                                <div>
                                                                    <div style={{ fontWeight: 600 }}>{seller.storeName}</div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{seller.phone}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 500 }}>{seller.user?.name}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{seller.user?.email}</div>
                                                        </td>
                                                        <td style={{ fontWeight: 700 }}>{seller.productCount || 0}</td>
                                                        <td>
                                                            <span className={`badge ${seller.isActive ? 'badge-new' : 'badge-clearance'}`}>
                                                                {seller.isActive ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button 
                                                                className={`btn btn-sm ${seller.isActive ? 'btn-danger' : 'btn-success'}`}
                                                                onClick={() => toggleSellerStatus(seller._id)}
                                                            >
                                                                {seller.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {sellers.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                                            No sellers found
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="modal-overlay" style={{ 
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', zIndex: 1000, padding: '20px' 
                }}>
                    <div className="glass-card" style={{ 
                        maxWidth: '800px', width: '100%', maxHeight: '90vh', 
                        overflowY: 'auto', padding: '32px', position: 'relative' 
                    }}>
                        <button 
                            className="btn btn-ghost" 
                            style={{ position: 'absolute', top: '20px', right: '20px' }}
                            onClick={() => { setSelectedProduct(null); setRejectionReason(''); }}
                        >
                            <FiXCircle size={24} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <div>
                                <img 
                                    src={selectedProduct.imageURL || 'https://placehold.co/400x400?text=No+Image'} 
                                    alt={selectedProduct.name} 
                                    style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} 
                                />
                                {!selectedProduct.imageURL && (
                                    <div style={{ marginTop: '12px', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiAlertTriangle /> <span>Warning: Missing product image</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{selectedProduct.name}</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>{selectedProduct.category} · {selectedProduct.brand}</p>
                                
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '24px' }}>
                                    {formatINR(selectedProduct.price)}
                                    {selectedProduct.basePrice > selectedProduct.price && (
                                        <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-muted)', marginLeft: '12px' }}>
                                            {formatINR(selectedProduct.basePrice)}
                                        </span>
                                    )}
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</h4>
                                    <p style={{ lineHeight: '1.6' }}>{selectedProduct.description}</p>
                                </div>

                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Seller Details</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={selectedProduct.seller?.storeLogo || 'https://placehold.co/40x40?text=S'} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{selectedProduct.seller?.storeName}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Seller ID: {selectedProduct.seller?._id}</div>
                                        </div>
                                    </div>
                                </div>

                                {selectedProduct.approvalStatus === 'pending' ? (
                                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                        <div className="form-group" style={{ marginBottom: '16px' }}>
                                            <label className="form-label">Rejection Reason (if rejecting)</label>
                                            <textarea 
                                                className="form-input" 
                                                rows="2" 
                                                placeholder="Explain why this product is being rejected..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button 
                                                className="btn btn-success" 
                                                style={{ flex: 1 }}
                                                onClick={() => handleModerate(selectedProduct._id, 'approved')}
                                            >
                                                Approve Product
                                            </button>
                                            <button 
                                                className="btn btn-danger" 
                                                style={{ flex: 1 }}
                                                onClick={() => handleModerate(selectedProduct._id, 'rejected', rejectionReason)}
                                            >
                                                Reject Product
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--border-light)', textAlign: 'center' }}>
                                        Status: <span className={`status-tag ${selectedProduct.approvalStatus}`}>{selectedProduct.approvalStatus}</span>
                                        {selectedProduct.rejectionReason && (
                                            <p style={{ marginTop: '8px', fontSize: '0.85rem' }}>Reason: {selectedProduct.rejectionReason}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
