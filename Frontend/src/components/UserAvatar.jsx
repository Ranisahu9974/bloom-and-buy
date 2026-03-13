import React from 'react';

const GOOGLE_COLORS = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC'];

const UserAvatar = ({ user, size = 32, style = {} }) => {
    if (!user) return null;

    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className="user-avatar"
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1px solid rgba(0,0,0,0.1)',
                    ...style
                }}
            />
        );
    }

    const firstLetter = (user.name || 'U').charAt(0).toUpperCase();
    const colorIndex = firstLetter.charCodeAt(0) % GOOGLE_COLORS.length;
    const bgColor = GOOGLE_COLORS[colorIndex];

    return (
        <div
            className="user-avatar user-avatar-text"
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                backgroundColor: bgColor,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: size * 0.45,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                ...style
            }}
            title={user.name}
        >
            {firstLetter}
        </div>
    );
};

export default UserAvatar;
