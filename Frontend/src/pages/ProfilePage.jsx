import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiPhone, FiMapPin, FiSave, FiAward, FiImage } from 'react-icons/fi';
import { formatINR } from '../utils/currency';
import UserAvatar from '../components/UserAvatar';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [form, setForm] = useState({
        name: '', phone: '', avatar: '', address: { street: '', city: '', state: '', zipCode: '', country: 'IN' }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setForm({ name: user.name, phone: user.phone || '', avatar: user.avatar || '', address: user.address || { street: '', city: '', state: '', zipCode: '', country: 'IN' } });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const { data } = await authAPI.updateProfile(form);
            updateUser(data.user);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const daysUntilExpiry = user?.membershipExpireDate ? Math.ceil((new Date(user.membershipExpireDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

    return (
        <div className="main-content">
            <div className="container section">
                <div className="page-header"><h1 className="page-title">My Profile</h1></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    <div>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <UserAvatar user={user} size={70} style={{ fontSize: '2.2rem' }} />
                                <div>
                                    <h2 style={{ fontSize: '1.3rem' }}>{user?.name}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span className={`tier-badge ${user?.membershipTier?.toLowerCase()}`}><FiAward size={10} /> {user?.membershipTier}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.points} points</span>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiUser size={12} /> Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiMail size={12} /> Email</label>
                                <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiImage size={12} /> Profile Avatar URL (Optional)</label>
                                <input className="form-input" placeholder="https://example.com/avatar.jpg" value={form.avatar} onChange={e => setForm({ ...form, avatar: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label"><FiPhone size={12} /> Phone</label>
                                <input className="form-input" placeholder="Optional" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                            </div>
                            <button className="btn btn-primary" onClick={handleSave} disabled={loading}><FiSave /> {loading ? 'Saving...' : 'Save Changes'}</button>
                        </div>
                    </div>
                    <div>
                        <div className="glass-card" style={{ padding: '32px', marginBottom: '16px' }}>
                            <h3 style={{ marginBottom: '16px' }}><FiMapPin size={16} /> Shipping Address</h3>
                            <div className="form-group"><input className="form-input" placeholder="Street" value={form.address.street} onChange={e => setForm({ ...form, address: { ...form.address, street: e.target.value } })} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><input className="form-input" placeholder="City" value={form.address.city} onChange={e => setForm({ ...form, address: { ...form.address, city: e.target.value } })} /></div>
                                <div className="form-group"><input className="form-input" placeholder="State" value={form.address.state} onChange={e => setForm({ ...form, address: { ...form.address, state: e.target.value } })} /></div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div className="form-group"><input className="form-input" placeholder="ZIP" value={form.address.zipCode} onChange={e => setForm({ ...form, address: { ...form.address, zipCode: e.target.value } })} /></div>
                                <div className="form-group"><input className="form-input" placeholder="Country" value={form.address.country} onChange={e => setForm({ ...form, address: { ...form.address, country: e.target.value } })} /></div>
                            </div>
                            <button className="btn btn-primary" onClick={handleSave} disabled={loading}><FiSave /> Save Address</button>
                        </div>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ marginBottom: '12px' }}>Account Info</h3>
                            <div className="summary-row"><span>Member Since</span><span>{new Date(user?.createdAt).toLocaleDateString()}</span></div>
                            <div className="summary-row"><span>Total Spent</span><span style={{ fontWeight: '700' }}>{formatINR(user?.totalSpent)}</span></div>
                            <div className="summary-row"><span>Wallet Balance</span><span style={{ color: 'var(--success)', fontWeight: '700' }}>{formatINR(user?.walletBalance)}</span></div>
                            <div className="summary-row"><span>Membership Expires</span><span>{daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
