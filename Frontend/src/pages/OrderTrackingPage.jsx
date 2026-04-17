import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { 
    FiCheck, FiPackage, FiTruck, FiHome, FiArrowLeft, FiMapPin, 
    FiClock, FiShoppingBag, FiBox, FiSend 
} from 'react-icons/fi';

const OrderTrackingPage = () => {
    const { id } = useParams();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) fetchTracking(id);
    }, [id]);

    const fetchTracking = async (orderId) => {
        try {
            setLoading(true);
            const { data } = await ordersAPI.track(orderId);
            setTracking(data);
        } catch (error) {
            toast.error('Failed to load tracking info');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;

    if (!tracking) return (
        <div className="main-content">
            <div className="container" style={{ padding: '200px 24px', textAlign: 'center' }}>
                <h3>Order not found or tracking not available</h3>
                <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Orders</Link>
            </div>
        </div>
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <FiClock />;
            case 'Confirmed': return <FiShoppingBag />;
            case 'Packed': return <FiBox />;
            case 'Shipped': return <FiSend />;
            case 'In Transit': return <FiTruck />;
            case 'Out for Delivery': return <FiPackage />;
            case 'Delivered': return <FiCheck />;
            default: return <FiInfo />;
        }
    };

    return (
        <div className="main-content">
            <div className="container" style={{ maxWidth: '900px', padding: '40px 20px' }}>
                <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiArrowLeft /> Back to My Orders
                </Link>

                <div className="glass-card" style={{ padding: '30px', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                        <div>
                            <h2 style={{ margin: 0 }}>Order Tracking</h2>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                ID: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>#{id}</span>
                            </p>
                        </div>
                        {tracking.estimatedDelivery && (
                            <div className="glass-card" style={{ padding: '12px 20px', textAlign: 'right', background: 'var(--action-dim)', border: 'none' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--action)', fontWeight: '600', textTransform: 'uppercase' }}>Est. Delivery</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--action)' }}>{new Date(tracking.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                        )}
                    </div>

                    {/* Stepper tracking */}
                    <div className="tracking-stepper" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginBottom: '50px', padding: '0 10px' }}>
                        <div style={{ 
                            position: 'absolute', top: '24px', left: '40px', right: '40px', height: '3px', 
                            background: 'var(--border)', zIndex: 0 
                        }} />
                        
                        {tracking.steps.map((step, i) => (
                            <div key={i} style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '90px' }}>
                                <div style={{
                                    width: '48px', height: '48px', borderRadius: '16px', margin: '0 auto 12px',
                                    background: step.completed ? 'var(--action)' : 'var(--bg-card)',
                                    border: `2px solid ${step.completed ? 'var(--action)' : 'var(--border)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: step.completed ? 'white' : 'var(--text-muted)',
                                    boxShadow: step.current ? '0 0 20px var(--action-dim)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>
                                    {getStatusIcon(step.name)}
                                </div>
                                <span style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: step.current ? '800' : '600', 
                                    color: step.current ? 'var(--action)' : (step.completed ? 'var(--text-main)' : 'var(--text-muted)'),
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px'
                                }}>
                                    {step.name}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FiTruck size={14}/> Courier</div>
                            <div style={{ fontWeight: '700' }}>{tracking.carrier || 'Handing over to courier'}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}><FiMapPin size={14}/> Tracking ID</div>
                            <div style={{ fontWeight: '700', color: 'var(--action)' }}>{tracking.tracking_id || 'Generating ID...'}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FiCheck color="var(--success)" /> Activity Timeline
                    </h3>
                    <div className="timeline" style={{ position: 'relative', paddingLeft: '40px' }}>
                        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', background: 'var(--border)' }} />
                        
                        {/* Display real history from backend if available, otherwise fallback to basic steps */}
                        {(tracking.history && tracking.history.length > 0 ? tracking.history : tracking.steps.filter(s => s.completed)).reverse().map((entry, i) => (
                            <div key={i} style={{ marginBottom: '30px', position: 'relative' }}>
                                <div style={{ 
                                    position: 'absolute', left: '-36px', top: '2px', width: '16px', height: '16px', 
                                    borderRadius: '50%', background: i === 0 ? 'var(--action)' : 'var(--border)',
                                    border: '4px solid var(--bg-card)',
                                    boxShadow: i === 0 ? '0 0 10px var(--action-dim)' : 'none'
                                }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4 style={{ margin: 0, color: i === 0 ? 'var(--action)' : 'var(--text-main)' }}>{entry.status || entry.name}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--border)', padding: '2px 8px', borderRadius: '4px' }}>
                                        {entry.time ? new Date(entry.time).toLocaleString() : 'Just now'}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: '1.5' }}>
                                    {entry.message || `Your order status has been updated to ${entry.name.toLowerCase()}.`}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
