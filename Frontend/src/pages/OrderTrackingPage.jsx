import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiCheck, FiPackage, FiTruck, FiHome, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

const OrderTrackingPage = () => {
    const { id } = useParams();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            // Defensive check: strip /track if it accidentally got captured (though router fix should prevent this)
            const cleanId = id.split('/')[0];
            fetchTracking(cleanId);
        }
    }, [id]);
    
    const fetchTracking = async (orderId) => {
        try {
            setLoading(true);
            console.log('Fetching tracking for order:', orderId);
            const { data } = await ordersAPI.track(orderId);
            setTracking(data);
        } catch (error) {
            console.error('Tracking fetch error:', error);
            toast.error('Failed to load tracking info');
            setTracking(null);
        } finally {
            setLoading(false);
        }
    };

    const getStepIcon = (name, completed, current) => {
        if (completed && !current) return <FiCheck />;
        const icons = {
            'Confirmed': <FiCheck />,
            'Packed': <FiPackage />,
            'Shipped': <FiTruck />,
            'In Transit': <FiTruck />,
            'Out for Delivery': <FiTruck />,
            'Delivered': <FiHome />
        };
        return icons[name] || <FiPackage />;
    };

    if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;

    if (!tracking) return (
        <div className="main-content">
            <div className="container" style={{ padding: '40px 24px' }}>
                <div className="empty-state">
                    <h3>Tracking not available</h3>
                    <Link to="/orders" className="btn btn-primary">Back to Orders</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="main-content">
            <div className="container" style={{ padding: '40px 24px' }}>
                <Link to="/orders" className="btn btn-ghost" style={{ marginBottom: '20px' }}>
                    <FiArrowLeft /> Back to Orders
                </Link>

                <div className="page-header">
                    <h1 className="page-title">Order Tracking</h1>
                    <p className="page-subtitle">Order #{(tracking.orderId || id)?.slice(-8).toUpperCase()}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                    <div>
                        {/* Status Card */}
                        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                        Current Status
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: '700' }}>
                                        {tracking.currentStatus || 'Unknown'}
                                    </div>
                                </div>
                                {tracking.estimatedDelivery && (
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                            Estimated Delivery
                                        </div>
                                        <div style={{ fontWeight: '600', color: 'var(--primary-light)' }}>
                                            {new Date(tracking.estimatedDelivery).toLocaleDateString('en-US', {
                                                weekday: 'short', month: 'short', day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Delay Warning */}
                            {tracking.delayInfo?.isDelayed && (
                                <div className="delay-alert">
                                    <FiAlertTriangle />
                                    <span>
                                        Delay detected ({tracking.delayInfo.hours}hrs): {tracking.delayInfo.reason}
                                    </span>
                                </div>
                            )}

                            {tracking.slaBreached && (
                                <div style={{
                                    marginTop: '12px', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    fontSize: '0.85rem', color: 'var(--error)'
                                }}>
                                    ⚠️ SLA breach detected. {tracking.compensationApplied || 'Compensation being processed.'}
                                </div>
                            )}
                        </div>

                        {/* Delivery Map Graphic */}
                        <div className="glass-card" style={{ padding: '28px', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '32px' }}>Delivery Route</h3>
                            <div className="delivery-map-container">
                                <div className="location-node origin">
                                    <div className="node-dot"><FiPackage /></div>
                                    <div className="node-label">
                                        <span className="label-title">Shipped From</span>
                                        <span className="label-city">{tracking.originCity || 'Warehouse'}</span>
                                    </div>
                                </div>

                                <div className="delivery-path">
                                    <div className="path-line"></div>
                                    <div 
                                        className="path-progress" 
                                        style={{ 
                                            width: (tracking.steps.filter(s => s.completed).length / tracking.steps.length) * 100 + '%' 
                                        }}
                                    ></div>
                                    <div 
                                        className="delivery-truck-icon"
                                        style={{ 
                                            left: (tracking.steps.filter(s => s.completed).length / tracking.steps.length) * 100 + '%',
                                            transform: 'translateX(-50%) ' + (tracking.currentStatus === 'Delivered' ? 'scale(0)' : 'scale(1)')
                                        }}
                                    >
                                        <FiTruck />
                                    </div>
                                </div>

                                <div className={'location-node destination ' + (tracking.currentStatus === 'Delivered' ? 'reached' : '')}>
                                    <div className="node-dot"><FiHome /></div>
                                    <div className="node-label">
                                        <span className="label-title">Destination</span>
                                        <span className="label-city">{tracking.destinationCity || 'Customer'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="glass-card" style={{ padding: '28px' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '24px' }}>Delivery Progress</h3>
                            <div className="tracking-timeline">
                                {(tracking.steps || []).map((step, i) => (
                                    <div key={i} className={'tracking-step ' + (step.completed ? (step.current ? 'current' : 'completed') : '')}>
                                        <div className="step-icon">
                                            {getStepIcon(step.name, step.completed, step.current)}
                                        </div>
                                        <div className="step-content">
                                            <h4>{step.name}</h4>
                                            {/* Find matching history entry */}
                                            {tracking.statusHistory && (() => {
                                                const historyEntry = tracking.statusHistory.find(h => h.status === step.name);
                                                if (historyEntry) {
                                                    return (
                                                        <p>
                                                            {new Date(historyEntry.timestamp).toLocaleString()}
                                                            {historyEntry.location ? ` • ${historyEntry.location}` : ''}
                                                        </p>
                                                    );
                                                }
                                                return step.completed ? null : <p style={{ color: 'var(--text-muted)' }}>Pending</p>;
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>Order Info</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Risk Score</span>
                                    <span className={`status-tag ${(tracking.riskScore || 'low').toLowerCase()}`}>
                                        {tracking.riskScore || 'Low'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
