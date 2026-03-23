import { useState, useEffect } from 'react';
import { membershipAPI } from '../utils/api';
import { FiAward, FiPercent, FiTruck, FiStar, FiZap, FiGift, FiClock } from 'react-icons/fi';
import { formatINR } from '../utils/currency';

const MembershipPage = () => {
    const [membership, setMembership] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await membershipAPI.get();
                setMembership(data);
            } catch (error) {
                console.error('Failed to fetch membership');
            } finally { setLoading(false); }
        };
        fetch();
    }, []);

    if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner" /></div></div>;
    if (!membership) return null;

    const tierColors = { Gold: 'gold', Silver: 'silver', Basic: 'basic' };
    const tierEmoji = { Gold: '👑', Silver: '🥈', Basic: '⭐' };

    return (
        <div className="main-content">
            <div className="container section">
                <div className="page-header"><h1 className="page-title">Membership</h1><p className="page-subtitle">Your rewards and benefits</p></div>

                <div className={`membership-card ${tierColors[membership.tier]}`}>
                    <div className="tier-header">
                        <div className={`tier-icon ${tierColors[membership.tier]}`}>{tierEmoji[membership.tier]}</div>
                        <div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{membership.tier} Member</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Member since {new Date(membership.memberSince).toLocaleDateString()} · {membership.daysUntilExpiry} days remaining
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-light)' }}>{membership.points}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Points</div>
                        </div>
                    </div>

                    {membership.nextTier && (
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Progress to {membership.nextTier}</span>
                                <span style={{ fontWeight: '600' }}>{membership.progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div className={`progress-fill ${tierColors[membership.tier]}`} style={{ width: `${membership.progress}%` }} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Spend {formatINR(membership.benefits.spendToNextTier)} more to unlock {membership.nextTier}
                            </p>
                        </div>
                    )}
                </div>

                <h3 style={{ fontSize: '1.3rem', marginTop: '40px', marginBottom: '20px' }}>Your Benefits</h3>
                <div className="benefits-grid">
                    <div className="benefit-item"><div className="benefit-icon"><FiPercent /></div><div className="benefit-text"><strong>{membership.benefits.discount} Discount</strong>On every order</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><FiGift /></div><div className="benefit-text"><strong>{membership.benefits.cashbackRate} Cashback</strong>Credited to wallet</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><FiTruck /></div><div className="benefit-text"><strong>Free Shipping</strong>{membership.benefits.freeShipping === true ? 'On all orders' : membership.benefits.freeShipping || 'Not included'}</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><FiZap /></div><div className="benefit-text"><strong>Early Access</strong>{membership.benefits.earlyAccess ? 'Enabled' : 'Gold only'}</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><FiStar /></div><div className="benefit-text"><strong>{membership.benefits.pointsRate} Points</strong>Per rupee spent</div></div>
                    <div className="benefit-item"><div className="benefit-icon"><FiAward /></div><div className="benefit-text"><strong>Priority Support</strong>{membership.tier === 'Gold' ? 'Enabled' : 'Gold only'}</div></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '40px' }}>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>💰 Wallet Balance</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--success)' }}>{formatINR(membership.walletBalance)}</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>Available cashback to use on orders (max ₹4,150/order)</p>
                    </div>
                    <div className="glass-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px' }}>📊 Spending Summary</h3>
                        <div className="summary-row"><span>Total Spent</span><span style={{ fontWeight: '700' }}>{formatINR(membership.totalSpent)}</span></div>
                        <div className="summary-row"><span>Points Earned</span><span style={{ fontWeight: '700' }}>{membership.points}</span></div>
                        <div className="summary-row"><span>Current Tier</span><span className={`tier-badge ${tierColors[membership.tier]}`}>{membership.tier}</span></div>
                    </div>
                </div>

                {membership.cashbackHistory?.length > 0 && (
                    <div style={{ marginTop: '40px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Recent Cashback</h3>
                        <div className="glass-card" style={{ overflow: 'hidden' }}>
                            <table className="data-table">
                                <thead><tr><th>Amount</th><th>Source</th><th>Expires</th><th>Status</th></tr></thead>
                                <tbody>
                                    {membership.cashbackHistory.slice(0, 10).map(cb => (
                                        <tr key={cb._id}>
                                            <td style={{ fontWeight: '600', color: 'var(--success)' }}>{formatINR(cb.amount)}</td>
                                            <td style={{ textTransform: 'capitalize' }}>{cb.source}</td>
                                            <td>{new Date(cb.expiresAt).toLocaleDateString()}</td>
                                            <td><span className={`status-tag ${cb.isUsed ? 'cancelled' : 'delivered'}`}>{cb.isUsed ? 'Used' : 'Active'}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MembershipPage;
