import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { FiBell, FiAlertCircle, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const AnnouncementBoard = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const { data } = await authAPI.getAnnouncements();
                setAnnouncements(data);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [user]);

    if (loading) return null;
    if (announcements.length === 0) return null;

    return (
        <div className="announcement-board section" style={{ marginBottom: '40px' }}>
            <div className="container">
                <div style={{ display: 'grid', gap: '16px' }}>
                    {announcements.map((ann, idx) => (
                        <div key={ann.id} className="glass-card" style={{ 
                            padding: '16px 24px', 
                            borderLeft: '4px solid var(--action)',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '16px',
                            background: 'rgba(99, 102, 241, 0.08)',
                            animation: `slideIn 0.5s ease forwards ${idx * 0.1}s`,
                            opacity: 0,
                            transform: 'translateY(20px)'
                        }}>
                            <div className="icon-box" style={{ background: 'var(--action)', padding: '10px', borderRadius: '50%', flexShrink: 0 }}>
                                <FiBell color="white" size={18} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0, color: 'var(--action)', fontSize: '1.1rem' }}>{ann.title}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(ann.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                                    {ann.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slideIn {
                    to { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default AnnouncementBoard;
