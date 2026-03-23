import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi';

const RegisterPage = () => {
    const [form, setForm] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        confirmPassword: '',
        role: 'user',
        storeName: '',
        storeLogo: ''
    });
    const [errors, setErrors] = useState({});
    const [showPw, setShowPw] = useState(false);
    const [showCpw, setShowCpw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
        if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Valid email is required';
        if (!form.phone || !/^\+[1-9]\d{9,14}$/.test(form.phone.trim())) errs.phone = 'International format required (e.g. +919876543210)';
        if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
        if (!/\d/.test(form.password)) errs.password = 'Password must include a number';
        if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        
        if (form.role === 'seller' && !form.storeName) {
            errs.storeName = 'Store name is required for sellers';
        }
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setLoading(true);
        try {
            await register(form);
            toast.success(form.role === 'seller' ? 'Welcome, Seller! 🏪' : 'Welcome to Bloom & Buy! 🌿');
            navigate(form.role === 'seller' ? '/seller' : '/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) });

    const pwStrength = form.password.length >= 8 && /\d/.test(form.password) && /[A-Z]/.test(form.password);
    const pwOk = form.password.length >= 6 && /\d/.test(form.password);

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2>{form.role === 'seller' ? 'Become a Seller' : 'Create Account'}</h2>
                    <p className="auth-subtitle">
                        {form.role === 'seller' 
                            ? 'Start your business journey with Bloom & Buy' 
                            : 'Join Bloom & Buy and start earning rewards'}
                    </p>
                </div>

                {/* Role Selection */}
                <div style={{ 
                    display: 'flex', 
                    background: 'var(--bg-input, #f3f4f6)', 
                    borderRadius: '12px', 
                    padding: '4px', 
                    marginBottom: '24px',
                    border: '1px solid var(--border)' 
                }}>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, role: 'user'})}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: form.role === 'user' ? 'var(--primary, #ff9900)' : 'transparent',
                            color: form.role === 'user' ? '#fff' : 'var(--text-muted, #666)',
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Customer
                    </button>
                    <button 
                        type="button"
                        onClick={() => setForm({...form, role: 'seller'})}
                        style={{
                            flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                            background: form.role === 'seller' ? 'var(--primary, #ff9900)' : 'transparent',
                            color: form.role === 'seller' ? '#fff' : 'var(--text-muted, #666)',
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Seller
                    </button>
                </div>

                {/* Perks */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    {(form.role === 'seller' 
                        ? ['Sell globally', 'Low commission', 'Instant payouts'] 
                        : ['Free to join', '2% cashback', 'Exclusive deals']
                    ).map(b => (
                        <span key={b} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', color: '#065f46', border: '1px solid #d1fae5', borderRadius: '20px', padding: '4px 10px', fontSize: '0.74rem', fontWeight: 600 }}>
                            <FiCheck size={11} /> {b}
                        </span>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="form-group">
                            <label className="form-label"><FiUser size={13} /> Full Name</label>
                            <input className={`form-input ${errors.name ? 'error' : ''}`} type="text" placeholder="John Doe" autoComplete="name" {...field('name')} />
                            {errors.name && <div className="form-error">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">📱 Mobile Number</label>
                            <input className={`form-input ${errors.phone ? 'error' : ''}`} type="tel" placeholder="+91 98..." autoComplete="tel" {...field('phone')} />
                            {errors.phone && <div className="form-error">{errors.phone}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FiMail size={13} /> Email Address</label>
                        <input className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" autoComplete="email" {...field('email')} />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>

                    {form.role === 'seller' && (
                        <div className="fade-in" style={{ borderTop: '1px dashed var(--border)', paddingTop: '16px', marginTop: '8px', marginBottom: '16px' }}>
                            <div className="form-group">
                                <label className="form-label">🏪 Store Name</label>
                                <input className={`form-input ${errors.storeName ? 'error' : ''}`} type="text" placeholder="Your Amazing Store" {...field('storeName')} />
                                {errors.storeName && <div className="form-error">{errors.storeName}</div>}
                            </div>
                            <div className="form-group">
                                <label className="form-label">🖼️ Store Logo URL (Optional)</label>
                                <input className="form-input" type="text" placeholder="https://example.com/logo.png" {...field('storeLogo')} />
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label"><FiLock size={13} /> Password</label>
                        <div className="password-input-wrapper">
                            <input
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                type={showPw ? 'text' : 'password'}
                                placeholder="Min 6 chars with a number"
                                autoComplete="new-password"
                                style={{ paddingRight: '40px' }}
                                {...field('password')}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {form.password && (
                            <div style={{ marginTop: '6px', display: 'flex', gap: '4px' }}>
                                {[1, 2, 3].map(n => (
                                    <div key={n} style={{ flex: 1, height: '3px', borderRadius: '2px', background: n === 1 ? (form.password.length >= 6 ? '#ff9900' : '#e0e0e0') : n === 2 ? (pwOk ? '#ff9900' : '#e0e0e0') : (pwStrength ? '#22c55e' : '#e0e0e0'), transition: 'background 0.3s' }} />
                                ))}
                                <span style={{ fontSize: '0.7rem', color: '#888', marginLeft: '4px' }}>
                                    {pwStrength ? 'Strong' : pwOk ? 'Good' : 'Weak'}
                                </span>
                            </div>
                        )}
                        {errors.password && <div className="form-error">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label"><FiLock size={13} /> Confirm Password</label>
                        <div className="password-input-wrapper">
                            <input
                                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                                type={showCpw ? 'text' : 'password'}
                                placeholder="Re-enter password"
                                autoComplete="new-password"
                                style={{ paddingRight: '40px' }}
                                {...field('confirmPassword')}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowCpw(v => !v)}>
                                {showCpw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? 'Processing...' : <><span>{form.role === 'seller' ? 'Register as Seller' : 'Create Free Account'}</span> <FiArrowRight size={16} /></>}
                    </button>
                </form>

                <p className="auth-footer" style={{ marginTop: '20px' }}>
                    Already have an account? <Link to="/login">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
