import { useState } from 'react';

const Button = ({
    text,
    onClick,
    type = "button",
    variant = "primary",
    loading = false,
    disabled = false,
    fullWidth = true,
    size = "medium",
    icon = null,
    iconPosition = "left",
    rounded = "medium",
    shadow = true,
    hoverEffect = true,
    animation = "none"
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isClicked, setIsClicked] = useState(false);

    const sizeStyles = {
        small: {
            padding: '8px 16px',
            fontSize: '0.75rem',
            minHeight: '36px'
        },
        medium: {
            padding: '12px 24px',
            fontSize: '0.875rem',
            minHeight: '44px'
        },
        large: {
            padding: '16px 32px',
            fontSize: '1rem',
            minHeight: '52px'
        },
        xlarge: {
            padding: '20px 40px',
            fontSize: '1.125rem',
            minHeight: '60px'
        }
    };

    const roundedStyles = {
        none: { borderRadius: '0px' },
        small: { borderRadius: '4px' },
        medium: { borderRadius: '8px' },
        large: { borderRadius: '16px' },
        full: { borderRadius: '9999px' }
    };

    const variantStyles = {
        primary: {
            backgroundColor: '#000000',
            color: '#ffffff',
            border: '1px solid #000000',
            hoverBackground: '#333333',
            activeBackground: '#1a1a1a',
            shadowColor: 'rgba(0, 0, 0, 0.2)'
        },
        secondary: {
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: '1px solid #6b7280',
            hoverBackground: '#4b5563',
            activeBackground: '#374151',
            shadowColor: 'rgba(107, 114, 128, 0.2)'
        },
        success: {
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: '1px solid #10b981',
            hoverBackground: '#059669',
            activeBackground: '#047857',
            shadowColor: 'rgba(16, 185, 129, 0.2)'
        },
        danger: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            border: '1px solid #ef4444',
            hoverBackground: '#dc2626',
            activeBackground: '#b91c1c',
            shadowColor: 'rgba(239, 68, 68, 0.2)'
        },
        warning: {
            backgroundColor: '#f59e0b',
            color: '#000000',
            border: '1px solid #f59e0b',
            hoverBackground: '#d97706',
            activeBackground: '#b45309',
            shadowColor: 'rgba(245, 158, 11, 0.2)'
        },
        info: {
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            border: '1px solid #3b82f6',
            hoverBackground: '#2563eb',
            activeBackground: '#1d4ed8',
            shadowColor: 'rgba(59, 130, 246, 0.2)'
        },
        outline: {
            backgroundColor: 'transparent',
            color: '#000000',
            border: '2px solid #000000',
            hoverBackground: '#000000',
            hoverColor: '#ffffff',
            activeBackground: '#333333',
            shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        ghost: {
            backgroundColor: 'transparent',
            color: '#000000',
            border: '1px solid transparent',
            hoverBackground: 'rgba(0, 0, 0, 0.05)',
            activeBackground: 'rgba(0, 0, 0, 0.1)',
            shadowColor: 'transparent'
        },
        gradient: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            border: 'none',
            hoverBackground: 'linear-gradient(135deg, #5a6fd8 0%, #68428f 100%)',
            activeBackground: 'linear-gradient(135deg, #4d5fc6 0%, #5b387f 100%)',
            shadowColor: 'rgba(102, 126, 234, 0.3)'
        }
    };

    const animationStyles = {
        none: {},
        pulse: {
            animation: 'pulse 2s infinite'
        },
        bounce: {
            animation: 'bounce 1s infinite'
        },
        wiggle: {
            animation: 'wiggle 0.5s ease-in-out infinite',
            animationPlayState: isHovered ? 'running' : 'paused'
        }
    };

    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 700,
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        outline: 'none',
        position: 'relative',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        minWidth: '120px',
        opacity: disabled || loading ? 0.6 : 1,
        transform: isClicked ? 'scale(0.98)' : isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: shadow
            ? `0 4px 6px ${variantStyles[variant]?.shadowColor || 'rgba(0, 0, 0, 0.1)'}`
            : 'none',
        ...sizeStyles[size],
        ...roundedStyles[rounded],
        ...animationStyles[animation]
    };

    const currentVariant = variantStyles[variant] || variantStyles.primary;
    const isGradient = variant === 'gradient';

    const dynamicStyle = {
        ...baseStyle,
        background: isGradient ? currentVariant.background : currentVariant.backgroundColor,
        color: currentVariant.color,
        border: currentVariant.border,
        ...(isHovered && hoverEffect && !disabled && !loading ? {
            background: isGradient ? currentVariant.hoverBackground : currentVariant.hoverBackground,
            color: currentVariant.hoverColor || currentVariant.color,
            boxShadow: shadow
                ? `0 10px 25px ${currentVariant.shadowColor}`
                : 'none',
        } : {}),
        ...(isClicked && !disabled && !loading ? {
            background: isGradient ? currentVariant.activeBackground : currentVariant.activeBackground,
            boxShadow: shadow
                ? `0 2px 4px ${currentVariant.shadowColor}`
                : 'none',
        } : {})
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => {
        setIsHovered(false);
        setIsClicked(false);
    };
    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const renderIcon = () => {
        if (!icon) return null;

        const iconStyle = {
            width: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
            height: size === 'small' ? '16px' : size === 'large' ? '24px' : '20px',
            transition: 'transform 0.3s ease',
            transform: isHovered && !disabled && !loading ? 'scale(1.1)' : 'scale(1)'
        };

        if (typeof icon === 'string') {
            return <span style={iconStyle}>{icon}</span>;
        }

        return icon;
    };

    return (
        <>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled || loading}
                style={dynamicStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleMouseUp}
            >
                {/* Ripple Effect */}
                {hoverEffect && !disabled && !loading && (
                    <span style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        transform: 'scale(0)',
                        animation: 'ripple 0.6s linear',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        width: '100px',
                        height: '100px',
                        pointerEvents: 'none',
                        animationPlayState: isClicked ? 'running' : 'paused'
                    }} />
                )}

                {/* Loading Spinner */}
                {loading && (
                    <span style={{
                        display: 'inline-flex',
                        marginRight: '8px',
                        animation: 'spin 1s linear infinite'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-6.219-8.56" />
                        </svg>
                    </span>
                )}

                {/* Icon and Text */}
                {iconPosition === 'left' && renderIcon()}
                <span style={{
                    display: 'inline-block',
                    transform: isClicked ? 'translateY(1px)' : 'translateY(0)',
                    transition: 'transform 0.2s ease'
                }}>
                    {loading ? "Processing..." : text}
                </span>
                {iconPosition === 'right' && renderIcon()}
            </button>

            {/* Inline CSS for animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                
                @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(2deg); }
                    75% { transform: rotate(-2deg); }
                }
                
                button:focus {
                    outline: 2px solid ${currentVariant.backgroundColor || currentVariant.background?.split(' ')[0] || '#000000'}40;
                    outline-offset: 2px;
                }
                
                button:active {
                    transform: scale(0.98);
                }
                
                button:hover:not(:disabled):not([aria-disabled="true"]) {
                    filter: brightness(1.1);
                }
            `}</style>
        </>
    );
};

export default Button;