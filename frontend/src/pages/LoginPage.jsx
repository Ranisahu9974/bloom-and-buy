import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Please fill in all fields'); return; }
        setLoading(true);
        try {
            const data = await login(email, password);
            toast.success(`Welcome to my website, ${data.user.name}! 👋`);
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLoginHook = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleLoading(true);
            try {
                // Use access token to get user info
                const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                }).then(r => r.json());

                console.log("UserInfo:", userInfo);

                const data = await loginWithGoogle({
                    idToken: tokenResponse.access_token,
                    name: userInfo.name,
                    email: userInfo.email,
                    avatar: userInfo.picture,
                });
                toast.success(`Welcome, ${data.user.name}! 🎉`);
                navigate('/');
            } catch (err) {
                console.error("Error inside Google callback:", err);
                toast.error(err.response?.data?.error || err.message || 'Error processing Google login');
            } finally {
                setGoogleLoading(false);
            }
        },
        onError: (error) => {
            console.error('Google login error:', error);
            toast.error('Google login failed. Please try again.');
            setGoogleLoading(false);
        }
    });

    const handleGoogleLogin = () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            toast.error('Google Sign-In requires VITE_GOOGLE_CLIENT_ID to be set in frontend .env.');
            return;
        }
        handleGoogleLoginHook();
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '16px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', padding: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="auth-subtitle">Sign in to your Bloom &amp; Buy account</p>
                </div>

                {/* Google Sign-in Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '10px', padding: '12px 20px', borderRadius: '10px', border: '1.5px solid var(--border)',
                        background: 'var(--card-bg)', color: 'var(--text-primary)', fontSize: '0.95rem',
                        fontWeight: 500, cursor: googleLoading ? 'not-allowed' : 'pointer', marginBottom: '16px',
                        transition: 'all 0.2s', opacity: googleLoading ? 0.7 : 1,
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4285f4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {googleLoading ? 'Connecting...' : 'Continue with Google'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0 20px' }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>or sign in with email</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
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
