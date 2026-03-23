import { useState } from 'react';

const PremiumImage = ({ src, alt, className = '', style = {}, onImageError }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleError = () => {
        setHasError(true);
        if (onImageError) onImageError();
    };

    if (hasError || !src) {
        return (
            <div
                className={`premium-image-fallback ${className}`}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    padding: '20px',
                    ...style
                }}
            >
                <img 
                    src="/logo.png" 
                    alt="Image not found" 
                    style={{ 
                        width: '60px', 
                        height: '60px', 
                        objectFit: 'contain', 
                        opacity: 0.3, 
                        filter: 'grayscale(100%)' 
                    }} 
                />
                <span style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: 500, opacity: 0.6 }}>No Image Available</span>
            </div>
        );
    }

    return (
        <div className={`premium-image-container ${className}`} style={{ position: 'relative', overflow: 'hidden', ...style }}>
            {!isLoaded && (
                <div
                    className="skeleton"
                    style={{ position: 'absolute', inset: 0, zIndex: 1 }}
                />
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity var(--transition-normal)',
                    ...style
                }}
            />
        </div>
    );
};

export default PremiumImage;
