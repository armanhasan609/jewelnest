import { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

const Input = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    required = true,
    disabled = false,
    error = false,
    errorMessage = "",
    success = false,
    successMessage = "",
    variant = "default", // "default", "outlined", "filled", "glass"
    size = "medium", // "small", "medium", "large"
    icon: Icon,
    showPasswordToggle = false,
    className = "",
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    const baseStyles = {
        width: '100%',
        padding: size === 'small' ? '0.5rem 0.75rem' : size === 'large' ? '1rem 1.25rem' : '0.75rem 1rem',
        borderRadius: '0.5rem',
        outline: 'none',
        transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.125rem' : '1rem',
        lineHeight: '1.5',
        backgroundColor: 'white',
        boxSizing: 'border-box',
        position: 'relative',
        zIndex: 1,
    };

    const variantStyles = {
        default: {
            border: `2px solid ${error ? '#ef4444' : success ? '#10b981' : '#e5e7eb'}`,
            backgroundColor: disabled ? '#f9fafb' : 'white',
            boxShadow: isFocused ? `0 0 0 3px ${error ? '#fecaca' : success ? '#a7f3d0' : '#dbeafe'}` : '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        outlined: {
            border: `2px solid ${error ? '#ef4444' : success ? '#10b981' : isFocused ? '#3b82f6' : isHovered ? '#94a3b8' : '#d1d5db'}`,
            backgroundColor: 'transparent',
            backdropFilter: 'blur(4px)',
            boxShadow: isFocused ? `0 0 0 1px ${error ? '#ef4444' : success ? '#10b981' : '#3b82f6'}` : 'none',
        },
        filled: {
            border: '2px solid transparent',
            backgroundColor: error ? '#fef2f2' : success ? '#f0fdf4' : '#f8fafc',
            boxShadow: isFocused ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)',
        },
        glass: {
            border: `1px solid ${error ? 'rgba(239, 68, 68, 0.3)' : success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.2)'}`,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            boxShadow: isFocused ? '0 8px 32px rgba(59, 130, 246, 0.1)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
            color: '#1f2937',
        },
    };

    const getInputStyles = () => ({
        ...baseStyles,
        ...variantStyles[variant],
        transform: isHovered && !isFocused && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.6 : 1,
    });

    const containerStyles = {
        marginBottom: '1.5rem',
        position: 'relative',
    };

    const labelStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        color: error ? '#ef4444' : success ? '#10b981' : variant === 'glass' ? '#ffffff' : '#4b5563',
        letterSpacing: '0.05em',
        transition: 'color 200ms ease',
    };

    const passwordToggleStyles = {
        position: 'absolute',
        right: size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#9ca3af',
        transition: 'color 200ms ease',
        padding: '0.25rem',
        borderRadius: '0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        ':hover': {
            color: '#4b5563',
        },
    };

    const iconStyles = {
        position: 'absolute',
        left: size === 'small' ? '0.75rem' : size === 'large' ? '1.25rem' : '1rem',
        top: '50%',
        transform: 'translateY(-50%)',
        color: error ? '#ef4444' : success ? '#10b981' : isFocused ? '#3b82f6' : '#9ca3af',
        transition: 'color 200ms ease',
        zIndex: 2,
    };

    const messageStyles = {
        fontSize: '0.75rem',
        marginTop: '0.375rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        opacity: error || success ? 1 : 0,
        transform: error || success ? 'translateY(0)' : 'translateY(-5px)',
        transition: 'all 300ms ease',
    };

    const characterCountStyles = {
        position: 'absolute',
        right: '0.75rem',
        bottom: '-1.25rem',
        fontSize: '0.75rem',
        color: '#9ca3af',
        fontVariantNumeric: 'tabular-nums',
    };

    // Character count for text inputs
    const showCharCount = type === 'text' || type === 'textarea' || type === 'password';
    const charCount = value?.length || 0;
    const maxLength = props.maxLength || 0;
    const isCharLimitReached = maxLength > 0 && charCount >= maxLength;

    return (
        <div style={containerStyles} className={className}>
            {label && (
                <label style={labelStyles}>
                    {label}
                    {required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
                    {success && <CheckCircle size={12} color="#10b981" />}
                    {error && <AlertCircle size={12} color="#ef4444" />}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                {Icon && (
                    <div style={iconStyles}>
                        <Icon size={size === 'small' ? 16 : size === 'large' ? 20 : 18} />
                    </div>
                )}

                <input
                    type={inputType}
                    style={{
                        ...getInputStyles(),
                        paddingLeft: Icon ? (size === 'small' ? '2.25rem' : size === 'large' ? '3rem' : '2.5rem') : undefined,
                        paddingRight: showPasswordToggle ? (size === 'small' ? '2.25rem' : size === 'large' ? '3rem' : '2.5rem') : undefined,
                    }}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    required={required}
                    disabled={disabled}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    {...props}
                />

                {type === 'password' && showPasswordToggle && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={passwordToggleStyles}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? (
                            <EyeOff size={size === 'small' ? 16 : size === 'large' ? 20 : 18} />
                        ) : (
                            <Eye size={size === 'small' ? 16 : size === 'large' ? 20 : 18} />
                        )}
                    </button>
                )}

                {/* Animated border effect */}
                {isFocused && variant !== 'glass' && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: '0.5rem',
                            border: `2px solid ${error ? '#ef4444' : success ? '#10b981' : '#3b82f6'}`,
                            pointerEvents: 'none',
                            zIndex: 0,
                            animation: 'pulse 2s infinite',
                        }}
                    />
                )}

                {/* Floating label animation */}
                {!label && placeholder && isFocused && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '-1.75rem',
                            left: 0,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: error ? '#ef4444' : success ? '#10b981' : '#3b82f6',
                            textTransform: 'uppercase',
                            opacity: isFocused ? 1 : 0,
                            transform: isFocused ? 'translateY(0)' : 'translateY(5px)',
                            transition: 'all 300ms ease',
                            letterSpacing: '0.05em',
                        }}
                    >
                        {placeholder}
                    </div>
                )}
            </div>

            {/* Character count */}
            {showCharCount && maxLength > 0 && (
                <div style={characterCountStyles}>
                    <span style={{ color: isCharLimitReached ? '#ef4444' : '#9ca3af' }}>
                        {charCount}/{maxLength}
                    </span>
                </div>
            )}

            {/* Error/Success messages */}
            {(errorMessage || successMessage) && (
                <div
                    style={{
                        ...messageStyles,
                        color: error ? '#ef4444' : '#10b981',
                    }}
                >
                    {error ? (
                        <>
                            <AlertCircle size={12} />
                            {errorMessage}
                        </>
                    ) : success ? (
                        <>
                            <CheckCircle size={12} />
                            {successMessage}
                        </>
                    ) : null}
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }

                input:focus {
                    animation: ${error ? 'shake 0.5s ease' : 'none'};
                }

                /* Remove number input arrows */
                input[type="number"]::-webkit-inner-spin-button,
                input[type="number"]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                input[type="number"] {
                    -moz-appearance: textfield;
                }

                /* Placeholder styling */
                ::placeholder {
                    color: #9ca3af;
                    opacity: 0.8;
                }

                input:focus::placeholder {
                    opacity: 0.5;
                }

                /* Custom focus outline for accessibility */
                input:focus-visible {
                    outline: 2px solid transparent;
                    outline-offset: 2px;
                }
            `}</style>
        </div>
    );
};

export default Input;