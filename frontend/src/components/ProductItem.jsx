import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ShoppingBag, Star, Zap, Shield, Truck, RotateCw, CheckCircle, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';

const ProductItem = ({
    id,
    image,
    name,
    price,
    discountPrice = null,
    reviewCount = 0,
    category = '',
    isNew = false,
    isBestSeller = false,
    stockStatus = 'in-stock',
    description = '',
    materials = [],
    deliveryInfo = 'Free shipping & returns',
    warranty = '2-Year Warranty',
    onAddToCart = null,
    onQuickView = null,
    hideQuickAdd = false,
    hideImageCount = false
}) => {
    const { addToCart } = useContext(ShopContext);
    const [isHovered, setIsHovered] = useState(false);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAnimatingCart, setIsAnimatingCart] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const navigate = useNavigate();
    const previewRef = useRef(null);

    // Luxury gradient fallback
    const fallbackImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23D4AF37;stop-opacity:0.1'/%3E%3Cstop offset='50%25' style='stop-color:%23C5A028;stop-opacity:0.05'/%3E%3Cstop offset='100%25' style='stop-color:%23B8860B;stop-opacity:0.1'/%3E%3C/linearGradient%3E%3CradialGradient id='r'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:0.2'/%3E%3Cstop offset='100%25' style='stop-color:transparent'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='400' height='500' fill='url(%23g)'/%3E%3Ccircle cx='200' cy='250' r='150' fill='url(%23r)'/%3E%3C/circle%3E%3C/svg%3E";

    // Gold color palette
    const goldColors = {
        primary: '#D4AF37',
        secondary: '#C5A028',
        dark: '#B8860B',
        light: '#F0E68C',
        gradient: 'linear-gradient(135deg, #D4AF37, #C5A028, #B8860B)'
    };

    // Close preview on escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showPreview) {
                setShowPreview(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showPreview]);

    // Helper function to get all image URLs from the image prop
    const getImageUrls = (img) => {
        if (!img) return [fallbackImage];

        if (Array.isArray(img)) {
            // Handle array of images
            return img.map(item => {
                if (!item) return fallbackImage;
                if (typeof item === 'string') return item;
                if (typeof item === 'object') return item.url || item.secure_url || fallbackImage;
                return fallbackImage;
            }).filter(url => url !== fallbackImage);
        }

        if (typeof img === 'string') return [img];
        if (typeof img === 'object') {
            const url = img.url || img.secure_url;
            return url ? [url] : [fallbackImage];
        }

        return [fallbackImage];
    };

    const imageUrls = getImageUrls(image);
    const mainImageSrc = imageUrls[0] || fallbackImage;

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

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAddingToCart) return;

        setIsAddingToCart(true);
        setIsAnimatingCart(true);

        try {
            // Use context addToCart function - it increments quantity
            if (addToCart && typeof addToCart === 'function') {
                // Add item to cart based on quantity
                for (let i = 0; i < quantity; i++) {
                    addToCart(id);
                }

                toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`, {
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                    style: {
                        background: '#1a1a1a',
                        color: goldColors.primary,
                        border: `1px solid ${goldColors.primary} 30`
                    }
                });

                // Reset quantity for next add
                setQuantity(1);
            } else {
                throw new Error('addToCart function not available');
            }

            setTimeout(() => setIsAnimatingCart(false), 600);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart', {
                position: "top-right",
                autoClose: 2000,
                theme: "dark"
            });
            setIsAnimatingCart(false);
        } finally {
            setTimeout(() => setIsAddingToCart(false), 600);
        }
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onQuickView) {
            onQuickView({ id, name, price, image: imageUrls, category });
        } else {
            setShowPreview(true);
            setSelectedImageIndex(0);
        }
    };

    const handleNavigate = (e) => {
        if (showPreview || isAnimatingCart) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        navigate(`/product/${id}`);
    };

    // Calculate discount
    const discountPercentage = discountPrice
        ? Math.round(((price - discountPrice) / price) * 100)
        : null;

    // Format price
    const formatPrice = (amount) => {
        return amount.toLocaleString('en-IN');
    };




    // Sizes for jewelry
    const sizes = [
        { id: 's', label: 'Small', available: true },
        { id: 'm', label: 'Medium', available: true },
        { id: 'l', label: 'Large', available: true },
        { id: 'xl', label: 'Custom', available: true }
    ];

    // Handle image navigation in preview
    const nextImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev + 1) % imageUrls.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setSelectedImageIndex((prev) => (prev - 1 + imageUrls.length) % imageUrls.length);
    };

    // Container styles
    const containerStyle = {
        textDecoration: 'none',
        color: '#1a202c',
        cursor: 'pointer',
        display: 'block',
        transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        borderRadius: '32px',
        overflow: 'hidden',
        position: 'relative',
        background: '#ffffff',
        border: `1px solid rgba(184, 134, 11, 0.08)`,
        boxShadow: isHovered
            ? `0 30px 60px - 15px rgba(184, 134, 11, 0.2)`
            : '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        transform: isHovered ? 'translateY(-12px)' : 'translateY(0)',
    };

    return (
        <Link
            to={`/product/${id}`}
            style={containerStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleNavigate}
            aria-label={`View ${name} details`}
        >
            {/* Product Image Container */}
            <div style={{
                overflow: 'hidden',
                background: '#fcfcfc',
                borderRadius: '24px 24px 0 0',
                position: 'relative',
                aspectRatio: '1/1',
                margin: '12px',
                marginBottom: '0'
            }}>
                {/* Loading Animation */}
                {!imgLoaded && !imgError && (
                    <div className="loading-shimmer" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '24px',
                        pointerEvents: 'none'
                    }} />
                )}

                {/* Product Image */}
                <img
                    src={mainImageSrc}
                    alt={name || 'Luxury Jewelry'}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isHovered ? 'scale(1.1) rotate(1deg)' : 'scale(1.05)',
                        opacity: imgLoaded ? '1' : '0',
                        borderRadius: '16px',
                        filter: isHovered
                            ? 'brightness(1.1) saturate(1.2) drop-shadow(0 10px 20px rgba(212, 175, 55, 0.2))'
                            : 'brightness(1) saturate(1)'
                    }}
                />

                {/* Hover Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear - gradient(to bottom, transparent 60 %, ${goldColors.primary}05)`,
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none'
                }} />

                {/* Multiple Images Indicator */}
                {(imageUrls.length > 1 && !hideImageCount) && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '16px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: goldColors.dark,
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '6px 12px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid rgba(184, 134, 11, 0.15)`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: '2',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        <ImageIcon size={10} />
                        {imageUrls.length} Images
                    </div>
                )}

                {/* Badges Container - Left Side */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: '2'
                }}>
                    {isNew && (
                        <div style={{
                            background: goldColors.gradient,
                            color: '#000',
                            fontSize: '10px',
                            fontWeight: '900',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            boxShadow: `0 6px 20px ${goldColors.primary} 40`,
                            animation: 'glow 2s infinite alternate',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Zap size={10} />
                            NEW COLLECTION
                        </div>
                    )}

                    {isBestSeller && (
                        <div style={{
                            background: '#ffffff',
                            color: goldColors.dark,
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            border: `1px solid ${goldColors.primary} 40`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)'
                        }}>
                            <Star size={10} fill={goldColors.primary} stroke={goldColors.dark} />
                            BESTSELLER
                        </div>
                    )}

                    {discountPercentage && (
                        <div style={{
                            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                            color: '#fff',
                            fontSize: '14px',
                            fontWeight: '900',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            boxShadow: '0 6px 20px rgba(220, 38, 38, 0.4)',
                            animation: 'pulseRed 1.5s infinite',
                            letterSpacing: '1px'
                        }}>
                            SAVE {discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Add to Cart Quick Overlay */}
                {!hideQuickAdd && (
                    <div style={{
                        position: 'absolute',
                        bottom: '0',
                        left: '0',
                        right: '0',
                        padding: '20px 16px',
                        background: 'linear-gradient(to top, rgba(255,255,255,0.95), transparent)',
                        backdropFilter: 'blur(8px)',
                        transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: '3'
                    }}>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                background: goldColors.gradient,
                                color: 'white',
                                border: 'none',
                                borderRadius: '50px',
                                padding: '10px 20px',
                                fontSize: '13px',
                                fontWeight: '700',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 20px rgba(184, 134, 11, 0.3)',
                            }}
                        >
                            <ShoppingBag size={18} />
                            QUICK ADD
                        </button>
                    </div>
                )}

                {/* Stock Status */}
                {stockStatus !== 'in-stock' && (
                    <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        color: stockStatus === 'low-stock' ? '#d97706' : '#dc2626',
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '6px 12px',
                        borderRadius: '30px',
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${stockStatus === 'low-stock' ? '#d9770640' : '#dc262640'} `,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        zIndex: '2',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}>
                        {stockStatus === 'low-stock' ? (
                            <>
                                <Zap size={10} />
                                LOW STOCK
                            </>
                        ) : (
                            'OUT OF STOCK'
                        )}
                    </div>
                )}
            </div>

            {/* Product Info Container */}
            <div style={{
                padding: '24px',
                background: '#ffffff',
                position: 'relative'
            }}>
                {/* Category */}
                {category && (
                    <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '8px',
                    }}>
                        {category}
                    </div>
                )}

                {/* Name and Price Container */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px'
                }}>
                    {/* Product Name */}
                    <p style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: '0',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: '1',
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: '1'
                    }}>
                        {name}
                    </p>

                    {/* Price Display on Card */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        flexShrink: 0
                    }}>
                        <span style={{
                            fontSize: '20px',
                            fontWeight: '800',
                            color: goldColors.dark
                        }}>
                            ₹{formatPrice(discountPrice || price)}
                        </span>
                        {discountPrice && (
                            <span style={{
                                fontSize: '13px',
                                color: '#94a3b8',
                                textDecoration: 'line-through',
                                fontWeight: '500'
                            }}>
                                ₹{formatPrice(price)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Premium Features */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingTop: '16px',
                    borderTop: `1px solid rgba(184, 134, 11, 0.08)`
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500'
                    }}>
                        <Shield size={14} color={goldColors.dark} />
                        <span>Certified</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#64748b',
                        fontWeight: '500'
                    }}>
                        <Truck size={14} color={goldColors.dark} />
                        <span>Free Delivery</span>
                    </div>
                </div>
            </div>

            {/* QUICK VIEW MODAL */}
            {showPreview && !onQuickView && (
                <div
                    ref={previewRef}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 99999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '40px',
                        animation: 'fadeIn 0.4s ease-out'
                    }}
                    onClick={() => setShowPreview(false)}
                >
                    <div
                        style={{
                            background: 'linear-gradient(145deg, #0f0f0f, #1a1a1a)',
                            borderRadius: '32px',
                            width: '90vw',
                            maxWidth: '1200px',
                            maxHeight: '90vh',
                            boxShadow: `
0 50px 100px - 20px rgba(212, 175, 55, 0.3),
    0 30px 60px - 30px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 ${goldColors.primary} 10
                            `,
                            animation: 'modalSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${goldColors.primary} 20`
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowPreview(false)}
                            style={{
                                position: 'absolute',
                                top: '24px',
                                right: '24px',
                                background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                                color: goldColors.primary,
                                border: `1px solid ${goldColors.primary} 30`,
                                borderRadius: '50%',
                                width: '44px',
                                height: '44px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                zIndex: '10',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                                e.currentTarget.style.background = goldColors.gradient;
                                e.currentTarget.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                                e.currentTarget.style.background = 'linear-gradient(145deg, #1a1a1a, #0f0f0f)';
                                e.currentTarget.style.color = goldColors.primary;
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Main Content Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '48px',
                            padding: '48px',
                            height: '100%',
                            overflowY: 'auto'
                        }}>
                            {/* Left Column - Images */}
                            <div>
                                <div style={{
                                    position: 'relative',
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    background: 'linear-gradient(145deg, #0a0a0a, #111)',
                                    aspectRatio: '1/1',
                                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                                    border: `1px solid ${goldColors.primary} 10`
                                }}>
                                    {/* Main Image */}
                                    <img
                                        src={imageUrls[selectedImageIndex] || fallbackImage}
                                        alt={`${name} - Image ${selectedImageIndex + 1} `}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '24px'
                                        }}
                                    />

                                    {/* Image Navigation Arrows (only show if multiple images) */}
                                    {imageUrls.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '16px',
                                                    transform: 'translateY(-50%)',
                                                    background: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    border: `1px solid ${goldColors.primary} `,
                                                    borderRadius: '50%',
                                                    width: '44px',
                                                    height: '44px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = goldColors.gradient;
                                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                                }}
                                            >
                                                <ChevronLeft size={24} />
                                            </button>

                                            <button
                                                onClick={nextImage}
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    right: '16px',
                                                    transform: 'translateY(-50%)',
                                                    background: 'rgba(0, 0, 0, 0.6)',
                                                    color: 'white',
                                                    border: `1px solid ${goldColors.primary} `,
                                                    borderRadius: '50%',
                                                    width: '44px',
                                                    height: '44px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = goldColors.gradient;
                                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                                    e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                                }}
                                            >
                                                <ChevronRight size={24} />
                                            </button>

                                            {/* Image Counter */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '16px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'rgba(0, 0, 0, 0.7)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {selectedImageIndex + 1} / {imageUrls.length}
                                            </div>
                                        </>
                                    )}

                                    {/* Badge Overlay */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '24px',
                                        left: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '12px'
                                    }}>
                                        {isNew && (
                                            <div style={{
                                                background: goldColors.gradient,
                                                color: '#000',
                                                fontSize: '12px',
                                                fontWeight: '900',
                                                padding: '10px 20px',
                                                borderRadius: '25px',
                                                letterSpacing: '2px',
                                                boxShadow: `0 10px 30px ${goldColors.primary} 40`,
                                                animation: 'glow 2s infinite alternate'
                                            }}>
                                                NEW ARRIVAL
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Thumbnail Gallery - Show actual product images */}
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginTop: '24px',
                                    padding: '0 8px',
                                    overflowX: 'auto',
                                    scrollbarWidth: 'thin'
                                }}>
                                    {imageUrls.map((imgUrl, index) => (
                                        <div
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImageIndex(index);
                                            }}
                                            style={{
                                                flex: '0 0 auto',
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(145deg, #0a0a0a, #111)',
                                                border: `2px solid ${selectedImageIndex === index ? goldColors.primary : '#333'} `,
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                overflow: 'hidden',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                                    e.currentTarget.style.borderColor = goldColors.primary;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedImageIndex !== index) {
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                    e.currentTarget.style.borderColor = '#333';
                                                }
                                            }}
                                        >
                                            <img
                                                src={imgUrl || fallbackImage}
                                                alt={`Thumbnail ${index + 1} `}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            {selectedImageIndex === index && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '4px',
                                                    right: '4px',
                                                    width: '12px',
                                                    height: '12px',
                                                    background: goldColors.primary,
                                                    borderRadius: '50%',
                                                    border: '2px solid #1a1a1a'
                                                }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Column - Details */}
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    color: goldColors.primary,
                                    textTransform: 'uppercase',
                                    letterSpacing: '3px',
                                    marginBottom: '16px'
                                }}>
                                    {category} COLLECTION
                                </div>

                                <h1 style={{
                                    fontSize: '36px',
                                    fontWeight: '800',
                                    color: '#fff',
                                    margin: '0 0 20px 0',
                                    lineHeight: '1.2'
                                }}>
                                    {name}
                                </h1>

                                {/* Description */}
                                <p style={{
                                    fontSize: '16px',
                                    color: '#aaa',
                                    lineHeight: '1.6',
                                    marginBottom: '32px'
                                }}>
                                    {description || 'Experience luxury craftsmanship with this exquisite piece. Meticulously handcrafted using premium materials for timeless elegance.'}
                                </p>
                            </div>

                            {/* Price Section */}
                            <div style={{
                                background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(196, 160, 40, 0.02))',
                                borderRadius: '20px',
                                padding: '24px',
                                border: `1px solid ${goldColors.primary} 10`
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: '20px',
                                    marginBottom: '16px'
                                }}>
                                    {discountPrice ? (
                                        <>
                                            <span style={{
                                                fontSize: '48px',
                                                fontWeight: '900',
                                                background: goldColors.gradient,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent'
                                            }}>
                                                ₹{formatPrice(discountPrice)}
                                            </span>
                                            <span style={{
                                                fontSize: '28px',
                                                color: '#666',
                                                textDecoration: 'line-through',
                                                fontWeight: '500'
                                            }}>
                                                ₹{formatPrice(price)}
                                            </span>
                                            <span style={{
                                                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                                                color: '#fff',
                                                padding: '8px 20px',
                                                borderRadius: '25px',
                                                fontSize: '16px',
                                                fontWeight: '900',
                                                letterSpacing: '1px'
                                            }}>
                                                SAVE ₹{formatPrice(price - discountPrice)}
                                            </span>
                                        </>
                                    ) : (
                                        <span style={{
                                            fontSize: '48px',
                                            fontWeight: '900',
                                            background: goldColors.gradient,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            ₹{formatPrice(price)}
                                        </span>
                                    )}
                                </div>

                                {/* Size Selection */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#fff',
                                        marginBottom: '12px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Select Size
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {sizes.map((size) => (
                                            <button
                                                key={size.id}
                                                onClick={() => setSelectedSize(size.id)}
                                                style={{
                                                    background: selectedSize === size.id
                                                        ? goldColors.gradient
                                                        : 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                                                    color: selectedSize === size.id ? '#000' : '#aaa',
                                                    border: `1px solid ${selectedSize === size.id
                                                        ? goldColors.primary
                                                        : '#333'
                                                        } `,
                                                    borderRadius: '12px',
                                                    padding: '12px 24px',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    minWidth: '80px'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (selectedSize !== size.id) {
                                                        e.currentTarget.style.background = 'linear-gradient(145deg, #2a2a2a, #1a1a1a)';
                                                        e.currentTarget.style.color = '#fff';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (selectedSize !== size.id) {
                                                        e.currentTarget.style.background = 'linear-gradient(145deg, #1a1a1a, #0f0f0f)';
                                                        e.currentTarget.style.color = '#aaa';
                                                    }
                                                }}
                                            >
                                                {size.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quantity Selection */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginBottom: '32px'
                                }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#fff',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Quantity
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        background: 'linear-gradient(145deg, #1a1a1a, #0f0f0f)',
                                        padding: '8px 16px',
                                        borderRadius: '12px',
                                        border: '1px solid #333'
                                    }}>
                                        <button
                                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                            style={{
                                                background: 'transparent',
                                                color: goldColors.primary,
                                                border: 'none',
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = goldColors.gradient;
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = goldColors.primary;
                                            }}
                                        >
                                            -
                                        </button>
                                        <span style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: '#fff',
                                            minWidth: '40px',
                                            textAlign: 'center'
                                        }}>
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(q => q + 1)}
                                            style={{
                                                background: 'transparent',
                                                color: goldColors.primary,
                                                border: 'none',
                                                fontSize: '20px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                width: '32px',
                                                height: '32px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = goldColors.gradient;
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = goldColors.primary;
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || stockStatus === 'out-of-stock'}
                                    style={{
                                        width: '100%',
                                        background: stockStatus === 'out-of-stock'
                                            ? '#666'
                                            : goldColors.gradient,
                                        color: stockStatus === 'out-of-stock' ? '#aaa' : '#000',
                                        border: 'none',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        fontSize: '16px',
                                        fontWeight: '900',
                                        cursor: stockStatus === 'out-of-stock' || isAddingToCart
                                            ? 'not-allowed'
                                            : 'pointer',
                                        textTransform: 'uppercase',
                                        letterSpacing: '2px',
                                        boxShadow: stockStatus === 'out-of-stock'
                                            ? 'none'
                                            : `0 12px 40px ${goldColors.primary} 40`,
                                        transition: 'all 0.3s ease',
                                        animation: isAnimatingCart ? 'cartBounce 0.6s ease' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (stockStatus !== 'out-of-stock' && !isAddingToCart) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = `0 20px 50px ${goldColors.primary} 60`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (stockStatus !== 'out-of-stock' && !isAddingToCart) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = `0 12px 40px ${goldColors.primary} 40`;
                                        }
                                    }}
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                border: `2px solid #000`,
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            ADDING TO CART...
                                        </>
                                    ) : stockStatus === 'out-of-stock' ? (
                                        'OUT OF STOCK'
                                    ) : (
                                        <>
                                            <ShoppingBag size={20} />
                                            ADD TO CART - ₹{formatPrice((discountPrice || price) * quantity)}
                                        </>
                                    )}
                                </button>
                            </div>

                            {/*Add price show without hover as well */}
                            <div>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#fff',
                                    marginBottom: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px'
                                }}>
                                    Price Details
                                </div>
                            </div>

                            {/* Features Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '16px'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(196, 160, 40, 0.02))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: `1px solid ${goldColors.primary} 10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Shield size={24} color={goldColors.primary} />
                                    <div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: goldColors.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Certified
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#aaa',
                                            fontWeight: '500'
                                        }}>
                                            Hallmarked & Authentic
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(196, 160, 40, 0.02))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: `1px solid ${goldColors.primary} 10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Truck size={24} color={goldColors.primary} />
                                    <div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: goldColors.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Free Delivery
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#aaa',
                                            fontWeight: '500'
                                        }}>
                                            2-3 Business Days
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(196, 160, 40, 0.02))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: `1px solid ${goldColors.primary} 10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <RotateCw size={24} color={goldColors.primary} />
                                    <div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: goldColors.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            Easy Returns
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#aaa',
                                            fontWeight: '500'
                                        }}>
                                            30-Day Policy
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'linear-gradient(145deg, rgba(212, 175, 55, 0.05), rgba(196, 160, 40, 0.02))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: `1px solid ${goldColors.primary} 10`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <CheckCircle size={24} color={goldColors.primary} />
                                    <div>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: goldColors.primary,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            2-Year Warranty
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: '#aaa',
                                            fontWeight: '500'
                                        }}>
                                            Guaranteed Quality
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ProductItem;