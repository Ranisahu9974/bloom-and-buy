import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success(`Welcome back, ${data.user.name}! 👋`);
            const days = data.membershipDaysRemaining;
            if (days && !isNaN(days) && days > 0 && days <= 30) {
                toast(`⚠️ Membership expiring in ${days} days`, { duration: 5000 });
            }
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '14px',
                        background: 'linear-gradient(135deg, #ff9900, #e68a00)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', fontSize: '1.5rem', boxShadow: '0 4px 16px rgba(255,153,0,0.35)'
                    }}>
                        🛍️
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your Bloom &amp; Buy account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <FiMail size={13} /> Email Address
                        </label>
                        <input
                            className="form-input"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <FiLock size={13} /> Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                className="form-input"
                                type={showPw ? 'text' : 'password'}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                style={{ paddingRight: '40px' }}
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '8px' }}>
                        {loading ? 'Signing In...' : <><span>Sign In</span> <FiArrowRight size={16} /></>}
                    </button>
                </form>

                <p className="auth-footer" style={{ marginTop: '24px' }}>
                    Don't have an account? <Link to="/register">Create one free</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
