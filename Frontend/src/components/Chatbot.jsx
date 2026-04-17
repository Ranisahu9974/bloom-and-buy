import { useState, useRef, useEffect } from 'react';
import { FiMessageSquare, FiX, FiSend, FiArrowRight, FiInfo, FiTrendingUp } from 'react-icons/fi';
import { aiAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Chatbot = () => {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Hi! I am BloomBot. I can help you find products, compare specs, or track your orders. What are you looking for today? 🌸' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    const suggestions = [
        "Best electronics under 50000",
        "Compare Samsung and iPhone",
        "Track my latest order",
        "Top rated Grocery items"
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const handleSend = async (queryText) => {
        const userMsg = queryText || input.trim();
        if (!userMsg || loading) return;

        if (!queryText) setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            const { data } = await aiAPI.chatbot(userMsg);
            setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
        } catch (error) {
            const status = error.response?.status;
            const responseData = error.response?.data;
            let fallback = null;

            if (responseData) {
                if (typeof responseData === 'string') {
                    fallback = responseData;
                } else if (responseData.response) {
                    fallback = responseData.response;
                } else if (responseData.error) {
                    fallback = responseData.error;
                } else {
                    fallback = JSON.stringify(responseData);
                }
            }

            if (!fallback) {
                if (status === 401) {
                    fallback = "BloomBot needs you to sign in again. Please refresh the page and log in.";
                } else if (status === 403) {
                    fallback = "BloomBot is blocked from accessing your account. Please re-authenticate.";
                } else if (error.message) {
                    fallback = `BloomBot is temporarily unavailable: ${error.message}`;
                } else {
                    fallback = "I'm having a small technical glitch, but I'm still here! Can you try rephrasing that?";
                }
            }

            setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div className="chatbot-wrapper" style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {/* Toggle Button */}
            {!isOpen && (
                <button 
                    className="chatbot-toggle pulse-animation"
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '64px', height: '64px', borderRadius: '22px', 
                        background: 'linear-gradient(135deg, var(--action), #8b5cf6)',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 10px 30px rgba(99,102,241,0.5)', border: 'none', cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                    }}
                >
                    <FiMessageSquare size={30} />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window glass-card" style={{
                    width: '380px', height: '580px', display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    borderRadius: '24px'
                }}>
                    {/* Header */}
                    <div className="chatbot-header" style={{
                        padding: '20px', background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                                width: 44, height: 44, borderRadius: '14px', 
                                background: 'linear-gradient(135deg, var(--action), #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                                boxShadow: '0 4px 12px rgba(99,102,241,0.3)'
                            }}>🌸</div>
                            <div>
                                <h4 style={{ margin: 0, fontWeight: '800', letterSpacing: '0.5px' }}>BloomBot</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Always Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-main)', cursor: 'pointer', padding: '8px', borderRadius: '10px' }}>
                            <FiX size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="messages-area" ref={scrollRef} style={{
                        flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px',
                        background: 'rgba(0,0,0,0.02)', scrollBehavior: 'smooth'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%', padding: '12px 16px', borderRadius: '18px',
                                background: msg.role === 'user' ? 'var(--action)' : 'var(--bg-card)',
                                color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                                fontSize: '0.92rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                lineWeight: '1.5', position: 'relative',
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '18px',
                                borderTopLeftRadius: msg.role === 'user' ? '18px' : '4px'
                            }}>
                                {msg.text}
                            </div>
                        ))}
                        
                        {loading && (
                            <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '18px', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', gap: '4px' }}>
                                <span className="dot-typing"></span> BloomBot is analyzing...
                            </div>
                        )}

                        {/* Suggestions */}
                        {!loading && messages.length < 4 && (
                            <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {suggestions.map((s, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => handleSend(s)}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                            padding: '8px 12px', borderRadius: '12px', fontSize: '0.8rem',
                                            color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s',
                                            display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--action)'; e.currentTarget.style.color = 'var(--action)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                    >
                                        <FiTrendingUp size={12} /> {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Input */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input 
                                className="form-input" 
                                style={{ 
                                    margin: 0, borderRadius: '16px', height: '52px', paddingLeft: '16px', paddingRight: '56px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)'
                                }}
                                placeholder="Message BloomBot..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                            />
                            <button 
                                className="btn btn-primary" 
                                style={{ 
                                    position: 'absolute', right: '6px', width: '40px', height: '40px', 
                                    padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '12px', boxShadow: 'none'
                                }}
                                disabled={loading}
                            >
                                <FiSend size={18} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                            Powered by OpenAI · Smart Product Analysis Enabled
                        </p>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
