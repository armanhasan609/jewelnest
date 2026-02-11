import React, { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom'
import { Eye, Heart, Sparkles, ChevronLeft, ChevronRight, Image as ImageIcon, ShoppingCart, Tag } from 'lucide-react'

const ProductItem = ({ id, image, images, name, price, originalPrice, salePrice, onSale, saleStartDate, saleEndDate, stock, bestseller, product }) => {
    const { currency, addToCart } = useContext(ShopContext);
    const [isHovered, setIsHovered] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [productImages, setProductImages] = useState([]);
    const [displayPrice, setDisplayPrice] = useState(0);
    const [effectiveOriginalPrice, setEffectiveOriginalPrice] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isOnSale, setIsOnSale] = useState(false);

    // Initialize images array and pricing
    useEffect(() => {
        const imageArray = getImagesArray();
        setProductImages(imageArray);

        if (product) {
            calculatePricing(product);
        } else {
            // Use props if product object is not provided
            calculatePricingFromProps();
        }
    }, [product, price, originalPrice, salePrice, onSale, saleStartDate, saleEndDate]);

    // Helper function to get images array
    const getImagesArray = () => {
        // If images prop is provided
        if (Array.isArray(images)) {
            return images;
        }

        // If image prop is provided
        if (image) {
            // If it's already an array, return it
            if (Array.isArray(image)) {
                return image;
            }
            // If it's a single string, wrap in array
            return [image];
        }

        // If product object has images
        if (product?.images) {
            if (Array.isArray(product.images)) {
                return product.images.map(img => img.url || img);
            }
        }

        // If product object has image
        if (product?.image) {
            if (Array.isArray(product.image)) {
                return product.image.map(img => img.url || img);
            }
            return [product.image];
        }

        // Fallback empty array
        return [];
    };

    // Function to check if sale is active
    const isSaleActive = (item) => {
        if (item.onSale === false) return false;

        const now = new Date();
        const saleStart = item.saleStartDate ? new Date(item.saleStartDate) : null;
        const saleEnd = item.saleEndDate ? new Date(item.saleEndDate) : null;

        // If no dates are set but onSale is true, sale is active
        if (item.onSale === true && !saleStart && !saleEnd) return true;

        // Check if current time is within sale period
        const isAfterStart = !saleStart || now >= saleStart;
        const isBeforeEnd = !saleEnd || now <= saleEnd;

        return isAfterStart && isBeforeEnd;
    };

    // Calculate pricing from product object
    const calculatePricing = (item) => {
        const onSale = isSaleActive(item);
        setIsOnSale(onSale);

        let effectivePrice = item.price;
        let effectiveOriginal = item.originalPrice || item.price;

        if (onSale && item.salePrice) {
            effectivePrice = item.salePrice;
        }

        setDisplayPrice(effectivePrice);
        setEffectiveOriginalPrice(effectiveOriginal);

        // Calculate discount
        if (effectiveOriginal > effectivePrice) {
            const discount = effectiveOriginal - effectivePrice;
            const percentage = Math.round((discount / effectiveOriginal) * 100);
            setDiscountAmount(discount);
            setDiscountPercentage(percentage);
        } else {
            setDiscountAmount(0);
            setDiscountPercentage(0);
        }
    };

    // Calculate pricing from individual props
    const calculatePricingFromProps = () => {
        const item = {
            price: price || 0,
            originalPrice: originalPrice || price || 0,
            salePrice: salePrice,
            onSale: onSale,
            saleStartDate: saleStartDate,
            saleEndDate: saleEndDate
        };

        calculatePricing(item);
    };

    const hasMultipleImages = productImages.length > 1;

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(id);
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
    };

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    };

    // Format price with Indian Rupee formatting
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0
        }).format(price);
    };

    // Auto-rotate images on hover
    useEffect(() => {
        if (!isHovered || !hasMultipleImages) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered, hasMultipleImages, productImages.length]);

    return (
        <Link
            to={`/product/${id}`}
            style={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                position: 'relative'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setCurrentImageIndex(0); // Reset to first image
            }}
        >
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transform: isHovered ? 'translateY(-10px)' : 'translateY(0)'
            }}>
                {/* Premium Badge */}
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    zIndex: '2'
                }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
                    }}>
                        <Sparkles size={10} />
                        Premium
                    </div>
                </div>

                {/* Sale Badge */}
                {isOnSale && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: product?.bestseller || bestseller ? '90px' : '60px',
                        zIndex: '2'
                    }}>
                        <div style={{
                            background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                            animation: discountPercentage > 0 ? 'pulse 1.5s infinite' : 'none'
                        }}>
                            <span>SALE</span>
                            {discountPercentage > 0 && (
                                <span style={{ fontSize: '9px' }}>
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Bestseller Badge */}
                {(product?.bestseller || bestseller) && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: isOnSale ? '150px' : '60px',
                        zIndex: '2'
                    }}>
                        <div style={{
                            background: 'linear-gradient(45deg, #059669, #10b981)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '10px',
                            fontWeight: '600',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                        }}>
                            <Sparkles size={10} />
                            Bestseller
                        </div>
                    </div>
                )}

                {/* Multiple Images Badge */}
                {hasMultipleImages && (
                    <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: (isOnSale || product?.bestseller || bestseller) ? '180px' : '16px',
                        zIndex: '2',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(4px)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        opacity: isHovered ? 1 : 0.8,
                        transition: 'opacity 0.3s ease'
                    }}>
                        <ImageIcon size={10} color="#b8860b" />
                        <span style={{
                            fontSize: '9px',
                            fontWeight: '600',
                            color: '#b8860b',
                            letterSpacing: '0.5px'
                        }}>
                            {productImages.length} views
                        </span>
                    </div>
                )}

                {/* SKU Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    left: '16px',
                    zIndex: '2',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)',
                    padding: '6px 12px',
                    fontSize: '9px',
                    fontWeight: '600',
                    letterSpacing: '0.5px',
                    color: '#1a202c',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    opacity: isHovered && hasMultipleImages ? '0' : '1',
                    transition: 'opacity 0.3s ease'
                }}>
                    <Tag size={9} />
                    SKU: {product?.sku || 'N/A'}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: '2',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isWishlisted ? '#fef2f2' : 'white',
                        border: `2px solid ${isWishlisted ? '#dc2626' : '#e5e7eb'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        transform: isHovered ? 'scale(1)' : 'scale(0)',
                        opacity: isHovered ? '1' : '0',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isHovered) {
                            e.currentTarget.style.transform = 'scale(0)';
                        } else {
                            e.currentTarget.style.transform = 'scale(1)';
                        }
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    <Heart
                        size={16}
                        style={{
                            color: isWishlisted ? '#dc2626' : '#6b7280',
                            fill: isWishlisted ? '#dc2626' : 'none'
                        }}
                    />
                </button>

                {/* Image Container */}
                <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    aspectRatio: '3/4',
                    backgroundColor: '#f9fafb'
                }}>
                    {productImages.length > 0 ? (
                        <>
                            <img
                                src={productImages[currentImageIndex]}
                                alt={`${name} - view ${currentImageIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                                }}
                            />

                            {/* Stock Status */}
                            <div style={{
                                position: 'absolute',
                                bottom: hasMultipleImages ? '60px' : '16px',
                                left: '16px',
                                zIndex: '3',
                                background: (product?.stock || stock || 0) > 0
                                    ? 'rgba(34, 197, 94, 0.95)'
                                    : 'rgba(239, 68, 68, 0.95)',
                                color: 'white',
                                padding: '6px 12px',
                                fontSize: '10px',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                backdropFilter: 'blur(4px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                opacity: (product?.stock || stock || 0) < 10 && (product?.stock || stock || 0) > 0 ? 1 : (isHovered ? 0 : 1),
                                transition: 'opacity 0.3s ease'
                            }}>
                                {(product?.stock || stock || 0) > 0 ? (
                                    <>
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: (product?.stock || stock || 0) < 10 ? '#fbbf24' : '#22c55e',
                                            animation: (product?.stock || stock || 0) < 10 ? 'pulse 1s infinite' : 'none'
                                        }}></div>
                                        {(product?.stock || stock || 0) < 10 ? `Only ${product?.stock || stock} left` : 'In Stock'}
                                    </>
                                ) : 'Out of Stock'}
                            </div>

                            {/* Image Navigation Arrows */}
                            {hasMultipleImages && isHovered && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        style={{
                                            position: 'absolute',
                                            left: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: '3',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s ease',
                                            opacity: isHovered ? 1 : 0
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#b8860b';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                            e.currentTarget.style.color = 'inherit';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                        }}
                                    >
                                        <ChevronLeft size={14} />
                                    </button>

                                    <button
                                        onClick={nextImage}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: '3',
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            border: 'none',
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            transition: 'all 0.3s ease',
                                            opacity: isHovered ? 1 : 0
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#b8860b';
                                            e.currentTarget.style.color = 'white';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                            e.currentTarget.style.color = 'inherit';
                                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                        }}
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </>
                            )}

                            {/* Image Dots Indicator */}
                            {hasMultipleImages && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    left: '0',
                                    right: '0',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    zIndex: '3',
                                    opacity: isHovered ? 1 : 0.7,
                                    transition: 'opacity 0.3s ease'
                                }}>
                                    {productImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setCurrentImageIndex(index);
                                            }}
                                            style={{
                                                width: currentImageIndex === index ? '20px' : '6px',
                                                height: '6px',
                                                borderRadius: '3px',
                                                background: currentImageIndex === index ? '#b8860b' : 'rgba(255, 255, 255, 0.7)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '0',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (currentImageIndex !== index) {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                                    e.currentTarget.style.width = '12px';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (currentImageIndex !== index) {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)';
                                                    e.currentTarget.style.width = '6px';
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Quick Add Button */}
                            <div style={{
                                position: 'absolute',
                                bottom: hasMultipleImages ? '40px' : '0',
                                left: '0',
                                right: '0',
                                padding: '16px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
                                transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                zIndex: '2'
                            }}>
                                <button
                                    onClick={handleQuickAdd}
                                    disabled={(product?.stock || stock || 0) <= 0}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: (product?.stock || stock || 0) > 0
                                            ? 'linear-gradient(45deg, #b8860b, #fbbf24)'
                                            : '#9ca3af',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: (product?.stock || stock || 0) > 0 ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={(e) => {
                                        if ((product?.stock || stock || 0) > 0) {
                                            e.currentTarget.style.transform = 'scale(1.05)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <ShoppingCart size={16} />
                                    {(product?.stock || stock || 0) > 0 ? 'Quick Add' : 'Out of Stock'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                padding: '20px'
                            }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'rgba(255, 255, 255, 0.8)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px'
                                }}>
                                    <ImageIcon size={20} style={{ color: '#9ca3af' }} />
                                </div>
                                <p style={{
                                    fontSize: '11px',
                                    color: '#6b7280',
                                    fontWeight: '500',
                                    margin: '0'
                                }}>
                                    No Images
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Product Details */}
                <div style={{
                    padding: '24px',
                    flex: '1',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        {/* Category Badge */}
                        <div style={{
                            fontSize: '10px',
                            color: '#b8860b',
                            fontWeight: '600',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            marginBottom: '8px'
                        }}>
                            JewelNest Collection
                        </div>

                        {/* Product Name */}
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a202c',
                            margin: '0 0 12px 0',
                            lineHeight: '1.4',
                            minHeight: '44px',
                            display: '-webkit-box',
                            WebkitLineClamp: '2',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {name}
                        </h3>

                        {/* Image Counter */}
                        {hasMultipleImages && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '12px',
                                opacity: 0.7
                            }}>
                                <ImageIcon size={10} color="#9ca3af" />
                                <span style={{
                                    fontSize: '10px',
                                    color: '#9ca3af',
                                    fontWeight: '500'
                                }}>
                                    View {currentImageIndex + 1} of {productImages.length}
                                </span>
                            </div>
                        )}

                        {/* Price Section */}
                        <div style={{
                            marginBottom: '16px'
                        }}>
                            {/* Current Price */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '8px',
                                marginBottom: '4px'
                            }}>
                                <span style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#b8860b'
                                }}>
                                    {currency}{formatPrice(displayPrice)}
                                </span>

                                {/* Original Price */}
                                {effectiveOriginalPrice > displayPrice && (
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#9ca3af',
                                        textDecoration: 'line-through'
                                    }}>
                                        {currency}{formatPrice(effectiveOriginalPrice)}
                                    </span>
                                )}
                            </div>

                            {/* Discount Amount */}
                            {discountAmount > 0 && (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px',
                                    marginTop: '4px'
                                }}>
                                    <span>Save {currency}{formatPrice(discountAmount)}</span>
                                    {discountPercentage > 0 && (
                                        <span style={{
                                            fontSize: '9px',
                                            background: 'rgba(255, 255, 255, 0.2)',
                                            padding: '2px 6px',
                                            borderRadius: '6px'
                                        }}>
                                            {discountPercentage}% OFF
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sale Timer */}
                        {isOnSale && product?.saleEndDate && (
                            <div style={{
                                marginBottom: '16px',
                                padding: '8px',
                                background: 'linear-gradient(45deg, #fef3c7, #fde68a)',
                                borderRadius: '8px',
                                border: '1px solid #fbbf24'
                            }}>
                                <div style={{
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#b8860b',
                                    marginBottom: '4px'
                                }}>
                                    ⚡ Sale Ends Soon!
                                </div>
                                <div style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#92400e'
                                }}>
                                    {new Date(product.saleEndDate).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* View Details Button */}
                    <button
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: 'white',
                            color: '#b8860b',
                            border: '2px solid #b8860b',
                            borderRadius: '12px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: 'auto'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#b8860b';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#b8860b';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Eye size={16} />
                        View Details
                    </button>
                </div>

                {/* Hover Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.1), transparent)',
                    opacity: isHovered ? '1' : '0',
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                    borderRadius: '20px'
                }}></div>

                {/* Glow Effect */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    boxShadow: isHovered ? '0 20px 40px rgba(184, 134, 11, 0.15)' : 'none',
                    borderRadius: '20px',
                    transition: 'box-shadow 0.4s ease',
                    pointerEvents: 'none'
                }}></div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
            `}</style>
        </Link>
    )
}

export default ProductItem;