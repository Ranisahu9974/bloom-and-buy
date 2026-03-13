import { useState, useEffect } from 'react';
import { sellerAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPackage, FiShoppingBag, FiDollarSign, FiTrendingUp, FiPlus, FiEdit2, FiTrash2, FiEye, FiAlertTriangle, FiX, FiSave } from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import PremiumImage from '../components/PremiumImage';

const SellerDashboard = () => {
    const { sellerProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [dashboard, setDashboard] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', category: 'Electronics', price: '', basePrice: '',
        stockQuantity: '', imageURL: '', brand: '', tags: ''
    });

    const categories = ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Automotive', 'Other'];

    useEffect(() => {
        if (activeTab === 'dashboard') fetchDashboard();
        else if (activeTab === 'products') fetchProducts();
        else if (activeTab === 'orders') fetchOrders();
    }, [activeTab]);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await sellerAPI.getDashboard();
            setDashboard(data);
        } catch (error) {
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await sellerAPI.getProducts({ limit: 50 });
            setProducts(data.products);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data } = await sellerAPI.getOrders({ limit: 30 });
            setOrders(data.orders);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProductForm({
            name: '', description: '', category: 'Electronics', price: '', basePrice: '',
            stockQuantity: '', imageURL: '', brand: '', tags: ''
        });
        setEditingProduct(null);
        setShowProductForm(false);
    };

    const openEditForm = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            basePrice: product.basePrice,
            stockQuantity: product.stockQuantity,
            imageURL: product.imageURL || '',
            brand: product.brand || '',
            tags: product.tags?.join(', ') || ''
        });
        setShowProductForm(true);
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...productForm,
                price: parseFloat(productForm.price),
                basePrice: parseFloat(productForm.basePrice),
                stockQuantity: parseInt(productForm.stockQuantity),
                tags: productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
            };

            if (editingProduct) {
                await sellerAPI.updateProduct(editingProduct._id, payload);
                toast.success('Product updated!');
            } else {
                await sellerAPI.addProduct(payload);
                toast.success('Product added!');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to save product');
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Are you sure you want to deactivate this product?')) return;
        try {
            await sellerAPI.deleteProduct(id);
            toast.success('Product deactivated');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    if (loading && !dashboard && !products.length) {
        return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;
    }

    return (
        <div className="main-content">
            <div className="container">
                <div className="admin-header" style={{ marginBottom: '32px' }}>
                    <div>
                        <h1 className="page-title">Seller Dashboard</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {sellerProfile?.storeName || 'My Store'} — Manage your products and orders
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    {[
                        { key: 'dashboard', label: 'Overview', icon: <FiTrendingUp /> },
                        { key: 'products', label: 'My Products', icon: <FiPackage /> },
                        { key: 'orders', label: 'Orders', icon: <FiShoppingBag /> }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => setActiveTab(tab.key)}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Dashboard Tab */}
                {activeTab === 'dashboard' && dashboard && (
                    <>
                        <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <FiPackage size={28} color="var(--primary)" />
                                <div style={{ fontSize: '2rem', fontWeight: '700', margin: '8px 0' }}>{dashboard.stats.totalProducts}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Active Products</div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <FiShoppingBag size={28} color="var(--accent)" />
                                <div style={{ fontSize: '2rem', fontWeight: '700', margin: '8px 0' }}>{dashboard.stats.totalOrders}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Orders</div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <FiDollarSign size={28} color="var(--success)" />
                                <div style={{ fontSize: '2rem', fontWeight: '700', margin: '8px 0' }}>{formatINR(dashboard.stats.totalRevenue)}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Revenue</div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                                <FiTrendingUp size={28} color="var(--info)" />
                                <div style={{ fontSize: '2rem', fontWeight: '700', margin: '8px 0' }}>{dashboard.stats.totalItemsSold}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Items Sold</div>
                            </div>
                        </div>

                        {(dashboard.stats.outOfStock > 0 || dashboard.stats.lowStock > 0) && (
                            <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', borderLeft: '4px solid var(--warning)' }}>
                                <FiAlertTriangle color="var(--warning)" style={{ marginRight: '8px' }} />
                                <span style={{ color: 'var(--warning)' }}>
                                    {dashboard.stats.outOfStock > 0 && `${dashboard.stats.outOfStock} out of stock`}
                                    {dashboard.stats.outOfStock > 0 && dashboard.stats.lowStock > 0 && ' · '}
                                    {dashboard.stats.lowStock > 0 && `${dashboard.stats.lowStock} low stock`}
                                </span>
                            </div>
                        )}

                        {/* Recent Orders */}
                        <h2 className="page-title" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Recent Orders</h2>
                        {dashboard.recentOrders && dashboard.recentOrders.length > 0 ? (
                            <div className="glass-card" style={{ overflow: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Product</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Qty</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Price</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                                            <th style={{ padding: '12px', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboard.recentOrders.map((order, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{order.itemName}</td>
                                                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{order.itemQuantity}</td>
                                                <td style={{ padding: '12px', fontSize: '0.9rem' }}>{formatINR(order.itemPrice)}</td>
                                                <td style={{ padding: '12px' }}>
                                                    <span className={`order-status-tag status-${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>
                            </div>
                        )}
                    </>
                )}

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 className="page-title" style={{ fontSize: '1.2rem' }}>My Products ({products.length})</h2>
                            <button className="btn btn-primary" onClick={() => { resetForm(); setShowProductForm(true); }}>
                                <FiPlus /> Add Product
                            </button>
                        </div>

                        {/* Product Form Modal */}
                        {showProductForm && (
                            <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(99,102,241,0.3)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                    <button className="btn btn-ghost" onClick={resetForm}><FiX /></button>
                                </div>
                                <form onSubmit={handleSubmitProduct}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                                        <div className="form-group">
                                            <label className="form-label">Product Name *</label>
                                            <input className="form-input" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Category *</label>
                                            <select className="form-input" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })}>
                                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Price (₹) *</label>
                                            <input className="form-input" type="number" step="1" min="1" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">MRP / Base Price (₹) *</label>
                                            <input className="form-input" type="number" step="1" min="1" value={productForm.basePrice} onChange={e => setProductForm({ ...productForm, basePrice: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Stock Quantity *</label>
                                            <input className="form-input" type="number" min="0" value={productForm.stockQuantity} onChange={e => setProductForm({ ...productForm, stockQuantity: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Brand</label>
                                            <input className="form-input" value={productForm.brand} onChange={e => setProductForm({ ...productForm, brand: e.target.value })} />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">Image URL</label>
                                            <input className="form-input" value={productForm.imageURL} onChange={e => setProductForm({ ...productForm, imageURL: e.target.value })} placeholder="https://..." />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">Description *</label>
                                            <textarea className="form-input" rows="3" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} required />
                                        </div>
                                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                            <label className="form-label">Tags (comma separated)</label>
                                            <input className="form-input" value={productForm.tags} onChange={e => setProductForm({ ...productForm, tags: e.target.value })} placeholder="e.g. wireless, premium" />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        <button className="btn btn-primary" type="submit">
                                            <FiSave /> {editingProduct ? 'Update Product' : 'Add Product'}
                                        </button>
                                        <button className="btn btn-ghost" type="button" onClick={resetForm}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Products List */}
                        {products.length === 0 ? (
                            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                                <FiPackage size={48} color="var(--text-muted)" />
                                <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No products yet. Add your first product!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {products.map(product => (
                                    <div key={product._id} className="glass-card" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                                            <PremiumImage src={product.imageURL} alt={product.name} fallbackIconSize={24} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <h3 style={{ fontSize: '1rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</h3>
                                                {!product.isActive && (
                                                    <span style={{ padding: '2px 8px', background: 'rgba(239,68,68,0.2)', color: 'var(--error)', borderRadius: '4px', fontSize: '0.7rem' }}>Inactive</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {product.category} · Stock: {product.stockQuantity}
                                            </div>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline', marginTop: '4px' }}>
                                                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{formatINR(product.price)}</span>
                                                {product.basePrice > product.price && (
                                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{formatINR(product.basePrice)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                            <button className="btn btn-ghost" onClick={() => openEditForm(product)} title="Edit">
                                                <FiEdit2 size={16} />
                                            </button>
                                            <button className="btn btn-ghost" onClick={() => handleDeleteProduct(product._id)} title="Deactivate" style={{ color: 'var(--error)' }}>
                                                <FiTrash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <>
                        <h2 className="page-title" style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Orders for My Products</h2>
                        {orders.length === 0 ? (
                            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                                <FiShoppingBag size={48} color="var(--text-muted)" />
                                <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No orders yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {orders.map(order => (
                                    <div key={order._id} className="glass-card" style={{ padding: '20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <div>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order #{order._id?.slice(-8)}</span>
                                                <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <span className={`order-status-tag status-${order.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                            Buyer: {order.user?.name || 'N/A'} ({order.user?.email || ''})
                                        </div>
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span>{item.name} × {item.quantity}</span>
                                                <span style={{ fontWeight: '600' }}>{formatINR(item.priceAtPurchase * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
