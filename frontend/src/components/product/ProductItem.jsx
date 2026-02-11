import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShopContext } from '../../context/ShopContext';

const ProductItem = ({
    id,
    _id, // Accept _id in case parent spreads props containing it
    image,
    name,
    price,
    discountPrice = null,
    originalPrice = null,
    salePrice = null,
    onSale = false,
    rating = null,
    reviewCount = 0,
    category = '',
    isNew = false,
    isBestSeller = false,
    stockStatus = 'in-stock',
    onAddToCart = null
}) => {
    const { addToCart } = useContext(ShopContext);
    const [isHovered, setIsHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAnimatingCart, setIsAnimatingCart] = useState(false);
    const navigate = useNavigate();

    // Resolve productId: verify existence of id or _id
    const productId = id || _id;

    // Fallback image with gradient
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='a' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23667eea;stop-opacity:0.1'/%3E%3Cstop offset='100%25' style='stop-color:%23764ba2;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23a)'/%3E%3Cpath d='M100,200 Q200,150 300,200' stroke='%23667eea' stroke-width='2' fill='none' opacity='0.3'/%3E%3Ccircle cx='200' cy='250' r='40' fill='%23764ba2' opacity='0.1'/%3E%3C/svg%3E";

    const handleImageLoad = () => {
        setImgLoaded(true);
        setImgError(false);
    };

    const handleImageError = (e) => {
        setImgError(true);
        setImgLoaded(true);
        if (e.target) {
            e.target.src = fallbackImage;
        }
    };

    const resolveImageSrc = (img) => {
        if (!img) return '';
        if (Array.isArray(img)) {
            const firstValid = img.find((i) => (typeof i === 'string' && i) || (i && (i.url || i.secure_url)));
            if (!firstValid) return '';
            return typeof firstValid === 'string' ? firstValid : (firstValid.url || firstValid.secure_url || '');
        }
        if (typeof img === 'string') return img;
        if (typeof img === 'object') return img.url || img.secure_url || '';
        return '';
    };

    const imageSrc = resolveImageSrc(image);

    const effectiveDiscountPrice = discountPrice ?? (onSale ? salePrice : null);
    const displayPrice = effectiveDiscountPrice ?? price;
    const originalDisplayPrice = originalPrice ?? price;

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAddingToCart) return;

        setIsAddingToCart(true);
        setIsAnimatingCart(true);

        try {
            if (onAddToCart) {
                await onAddToCart({ id: productId, name, price: displayPrice, image: imageSrc });
            } else if (addToCart) {
                addToCart(productId);
            } else {
                console.log('Added to cart:', { id: productId, name, price: displayPrice });
            }

            toast.success('Added to cart!', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Animation completion
            setTimeout(() => setIsAnimatingCart(false), 600);
        } catch (error) {
            toast.error('Failed to add to cart', {
                position: "top-right",
                autoClose: 2000,
            });
            setIsAnimatingCart(false);
        } finally {
            setTimeout(() => setIsAddingToCart(false), 600);
        }
    };

    const handleNavigate = () => {
        if (isAnimatingCart) return;

        if (productId) {
            navigate(`/product/${productId}`);
            window.scrollTo(0, 0); // Scroll to top to ensure the new product page is seen from start
        } else {
            console.error("ProductItem: Missing product ID for navigation", { name });
        }
    };

    // Calculate discount percentage
    const discountPercentage = effectiveDiscountPrice
        ? Math.round(((originalDisplayPrice - effectiveDiscountPrice) / originalDisplayPrice) * 100)
        : null;

    // Format price with commas
    const formatPrice = (amount) => {
        return amount.toLocaleString('en-IN');
    };

    // Render stars based on rating
    const renderStars = () => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="url(#halfStar)" stroke="none">
                        <defs>
                            <linearGradient id="halfStar" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="50%" stopColor="#fbbf24" />
                                <stop offset="50%" stopColor="#d1d5db" />
                            </linearGradient>
                        </defs>
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            } else {
                stars.push(
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#d1d5db" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            }
        }
        return stars;
    };

    // Container styles
    const containerStyle = {
        textDecoration: 'none',
        color: '#374151',
        cursor: 'pointer',
        display: 'block',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        boxShadow: isHovered
            ? '15px 15px 30px #d1d9e6, -15px -15px 30px #ffffff, 0 0 0 1px #e2e8f0'
            : '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff, 0 0 0 1px #f1f5f9',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
        animation: 'fadeInUp 0.6s ease-out'
    };

    // Image container
    const imageContainerStyle = {
        overflow: 'hidden',
        background: 'linear-gradient(145deg, #f8fafc, #ffffff)',
        borderRadius: '16px 16px 0 0',
        position: 'relative',
        aspectRatio: '4/5',
        margin: '12px',
        marginBottom: '0',
        boxShadow: 'inset 5px 5px 10px #e2e8f0, inset -5px -5px 10px #ffffff'
    };

    return (
        <div
            style={containerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleNavigate();
            }}
            aria-label={`View ${name} details`}
        >
            {/* Product Image Container */}
            <div style={imageContainerStyle}>
                {/* Loading Skeleton */}
                {!imgLoaded && !imgError && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'loading 1.5s infinite',
                        borderRadius: '16px',
                        pointerEvents: 'none'
                    }}></div>
                )}

                {/* Product Image */}
                <img
                    src={imageSrc || fallbackImage}
                    alt={name || 'Jewelry Product'}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                        opacity: imgLoaded ? '1' : '0',
                        borderRadius: '16px',
                        filter: isHovered ? 'brightness(1.05)' : 'brightness(1)'
                    }}
                />

                {/* Badges Container */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: '2'
                }}>
                    {isNew && (
                        <div style={{
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            animation: 'pulse 2s infinite'
                        }}>
                            New
                        </div>
                    )}

                    {isBestSeller && (
                        <div style={{
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}>
                            Bestseller
                        </div>
                    )}

                    {discountPercentage && (
                        <div style={{
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '800',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            animation: 'bounce 1s infinite'
                        }}>
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Add to Cart Button */}
                <button
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: isAddingToCart ? 'not-allowed' : 'pointer',
                        opacity: isHovered ? '1' : '0',
                        transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff',
                        zIndex: '2',
                        animation: isAnimatingCart ? 'cartPulse 0.6s ease-in-out' : 'none'
                    }}
                    onMouseEnter={(e) => {
                        if (!isAddingToCart) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isAddingToCart) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                            e.currentTarget.style.color = '#667eea';
                            e.currentTarget.style.transform = isHovered ? 'scale(1)' : 'scale(0.8)';
                            e.currentTarget.style.boxShadow = '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff';
                        }
                    }}
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    aria-label={isAddingToCart ? "Adding to cart..." : "Add to cart"}
                >
                    {isAddingToCart ? (
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                        </svg>
                    )}
                </button>

                {/* Stock Status */}
                {stockStatus !== 'in-stock' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '600',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(4px)',
                        zIndex: '2'
                    }}>
                        {stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                    </div>
                )}
            </div>

            {/* Product Info Container */}
            <div style={{
                padding: '16px',
                paddingTop: '12px'
            }}>
                {/* Category */}
                {category && (
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#667eea',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '6px',
                        opacity: 0.8
                    }}>
                        {category}
                    </div>
                )}

                {/* Product Name */}
                <p style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#1e293b',
                    margin: '0 0 8px 0',
                    lineHeight: '1.4',
                    transition: 'color 0.3s ease',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '42px'
                }}>
                    {name}
                </p>

                {/* Rating */}
                {(typeof rating === 'number' && rating > 0) && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '10px'
                    }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars()}
                        </div>
                        <span style={{
                            fontSize: '12px',
                            color: '#64748b',
                            fontWeight: '600'
                        }}>
                            {rating.toFixed(1)}
                            {reviewCount > 0 && ` (${reviewCount})`}
                        </span>
                    </div>
                )}

                {/* Price Container */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    {/* Discount Price */}
                    {effectiveDiscountPrice ? (
                        <>
                            <p style={{
                                fontSize: '20px',
                                fontWeight: '800',
                                color: '#1e293b',
                                margin: '0',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                ₹{formatPrice(displayPrice)}
                            </p>

                            {/* Original Price with strikethrough */}
                            <p style={{
                                fontSize: '15px',
                                fontWeight: '500',
                                color: '#94a3b8',
                                margin: '0',
                                textDecoration: 'line-through'
                            }}>
                                ₹{formatPrice(originalDisplayPrice)}
                            </p>
                        </>
                    ) : (
                        <p style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: '#1e293b',
                            margin: '0'
                        }}>
                            ₹{formatPrice(displayPrice)}
                        </p>
                    )}
                </div>

                {/* EMI Option */}

            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }

                @keyframes cartPulse {
                    0%, 100% { transform: scale(1); box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff; }
                    50% { transform: scale(1.2); box-shadow: 0 0 30px rgba(102, 126, 234, 0.6); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                /* Smooth focus styles */
                button:focus, a:focus {
                    outline: 2px solid rgba(102, 126, 234, 0.5);
                    outline-offset: 2px;
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default ProductItem;