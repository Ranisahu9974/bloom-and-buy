import React from 'react';

const SkeletonCard = ({ type = 'card' }) => {
    if (type === 'list-item') {
        return (
            <div className="drawer-item" style={{ pointerEvents: 'none' }}>
                <div className="drawer-item-img skeleton"></div>
                <div className="drawer-item-content pt-2">
                    <div className="skeleton skeleton-text short mb-2"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text price mt-2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="product-card" style={{ pointerEvents: 'none' }}>
            <div className="skeleton skeleton-image"></div>
            <div className="product-card-body">
                <div className="skeleton skeleton-text short mb-2" style={{ height: '12px', width: '40%' }}></div>
                <div className="skeleton skeleton-text" style={{ marginBottom: '16px' }}></div>
                <div className="skeleton skeleton-text price"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;
