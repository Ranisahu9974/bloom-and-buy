import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton skeleton-image"></div>
            <div className="skeleton-body">
                <div className="skeleton skeleton-text" style={{ width: '30%', marginBottom: '8px' }}></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px' }}>
                    <div className="skeleton skeleton-text short"></div>
                    <div className="skeleton" style={{ width: '38px', height: '38px', borderRadius: '50%' }}></div>
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
