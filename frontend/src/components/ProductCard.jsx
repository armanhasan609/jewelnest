import { ShoppingCart, Sparkles, Eye, Tag, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(ShopContext);
    const navigate = useNavigate();

    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [images, setImages] = useState([]);
    const [displayPrice, setDisplayPrice] = useState(0);
    const [originalPrice, setOriginalPrice] = useState(0);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [isOnSale, setIsOnSale] = useState(false);

    // Initialize images array and pricing
    useEffect(() => {
        if (product) {
            const imageArray = getImagesArray(product);
            setImages(imageArray);

            // Calculate pricing based on sale status
            calculatePricing(product);
        }
    }, [product]);

    // Helper function to get images array
    const getImagesArray = (item) => {
        if (!item) return [];

        // If item has images array
        if (Array.isArray(item.images)) {
            return item.images.map(img => img.url || img);
        }

        // If item has single image property
        if (item.image) {
            // If it's already an array, return it
            if (Array.isArray(item.image)) {
                return item.image.map(img => img.url || img);
            }
            // If it's a single string, wrap in array
            return [item.image];
        }

        return [];
    };

    // Function to check if sale is active
    const isSaleActive = (product) => {
        if (!product.onSale) return false;

        const now = new Date();
        const saleStart = product.saleStartDate ? new Date(product.saleStartDate) : null;
        const saleEnd = product.saleEndDate ? new Date(product.saleEndDate) : null;

        // If no dates are set, sale is always active
        if (!saleStart && !saleEnd) return true;

        // Check if current time is within sale period
        const isAfterStart = !saleStart || now >= saleStart;
        const isBeforeEnd = !saleEnd || now <= saleEnd;

        return isAfterStart && isBeforeEnd;
    };

    // Calculate pricing based on sale status
    const calculatePricing = (product) => {
        const onSale = isSaleActive(product);
        setIsOnSale(onSale);

        if (onSale && product.salePrice) {
            // Sale is active - use sale price
            setDisplayPrice(product.salePrice);
            setOriginalPrice(product.originalPrice || product.price);
        } else {
            // No sale - use normal price
            setDisplayPrice(product.price);
            setOriginalPrice(product.originalPrice || product.price);
        }

        // Calculate discount
        const effectiveOriginalPrice = product.originalPrice || product.price;
        const effectiveDisplayPrice = onSale && product.salePrice ? product.salePrice : product.price;

        if (effectiveOriginalPrice > effectiveDisplayPrice) {
            const discount = effectiveOriginalPrice - effectiveDisplayPrice;
            const percentage = Math.round((discount / effectiveOriginalPrice) * 100);
            setDiscountAmount(discount);
            setDiscountPercentage(percentage);
        } else {
            setDiscountAmount(0);
            setDiscountPercentage(0);
        }
    };

    const hasMultipleImages = images.length > 1;

    const handleImageError = (e) => {
        setImageError(true);
        e.currentTarget.style.display = 'none';
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        navigate(`/product/${product._id || product.id}`);
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();

        if (product._id || product.id) {
            addToCart(product._id || product.id);
            toast.success(`${product.name} added to cart!`, {
                position: "top-right",
                autoClose: 2000
            });
        } else {
            toast.error("Unable to add product to cart");
        }
    };

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [isHovered, hasMultipleImages, images.length]);

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                cursor: 'pointer',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transform: isHovered ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setCurrentImageIndex(0); // Reset to first image
            }}
            onClick={() => navigate(`/product/${product._id || product.id}`)}
        >
            {/* Premium Collection Badge */}
            <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: '20'
            }}>
                <div style={{
                    background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '700',
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
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
                    right: '16px',
                    zIndex: '20'
                }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                        animation: discountPercentage > 0 ? 'pulse 1.5s infinite' : 'none'
                    }}>
                        <span>SALE</span>
                        {discountPercentage > 0 && (
                            <span style={{ fontSize: '10px' }}>
                                {discountPercentage}% OFF
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Bestseller Badge */}
            {product.bestseller && (
                <div style={{
                    position: 'absolute',
                    top: isOnSale ? '56px' : '16px',
                    right: '16px',
                    zIndex: '20'
                }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #059669, #10b981)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                    }}>
                        <Sparkles size={10} />
                        Bestseller
                    </div>
                </div>
            )}

            {/* Multiple Images Indicator */}
            {hasMultipleImages && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: product.bestseller || isOnSale ? '90px' : '16px',
                    zIndex: '20',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}>
                    <ImageIcon size={12} color="#b8860b" />
                    <span style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#b8860b',
                        letterSpacing: '0.5px'
                    }}>
                        {images.length} views
                    </span>
                </div>
            )}

            {/* SKU Badge */}
            <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                zIndex: '20',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '6px 12px',
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.5px',
                color: '#1a202c',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: isHovered && hasMultipleImages ? '0' : '1',
                transition: 'opacity 0.3s ease'
            }}>
                <Tag size={10} />
                {product.sku || 'N/A'}
            </div>

            {/* Image Container */}
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                aspectRatio: '3/4',
                backgroundColor: '#f9fafb'
            }}>
                {!imageError && images.length > 0 ? (
                    <>
                        {/* Main Image */}
                        <img
                            src={images[currentImageIndex]}
                            alt={`${product.name} - view ${currentImageIndex + 1}`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease',
                                transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                            }}
                            onError={handleImageError}
                        />

                        {/* Stock Status */}
                        <div style={{
                            position: 'absolute',
                            bottom: hasMultipleImages ? '60px' : '20px',
                            left: '16px',
                            zIndex: '15',
                            background: product.stock > 0
                                ? 'rgba(34, 197, 94, 0.95)'
                                : 'rgba(239, 68, 68, 0.95)',
                            color: 'white',
                            padding: '6px 12px',
                            fontSize: '10px',
                            fontWeight: '700',
                            letterSpacing: '0.5px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            opacity: product.stock < 10 && product.stock > 0 ? 1 : (isHovered ? 0 : 1),
                            transition: 'opacity 0.3s ease'
                        }}>
                            {product.stock > 0 ? (
                                <>
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: product.stock < 10 ? '#fbbf24' : '#22c55e',
                                        animation: product.stock < 10 ? 'pulse 1s infinite' : 'none'
                                    }}></div>
                                    {product.stock < 10 ? `Only ${product.stock} left` : 'In Stock'}
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
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: '15',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        transition: 'all 0.3s ease',
                                        opacity: isHovered ? 1 : 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b8860b';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                        e.currentTarget.style.color = 'inherit';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    onClick={nextImage}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        zIndex: '15',
                                        background: 'rgba(255, 255, 255, 0.95)',
                                        border: 'none',
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        transition: 'all 0.3s ease',
                                        opacity: isHovered ? 1 : 0
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#b8860b';
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                        e.currentTarget.style.color = 'inherit';
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}

                        {/* Image Dots Indicator */}
                        {hasMultipleImages && (
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '0',
                                right: '0',
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '8px',
                                zIndex: '15'
                            }}>
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(index);
                                        }}
                                        style={{
                                            width: currentImageIndex === index ? '24px' : '8px',
                                            height: '8px',
                                            borderRadius: '4px',
                                            background: currentImageIndex === index ? '#b8860b' : 'rgba(255, 255, 255, 0.6)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0',
                                            transition: 'all 0.3s ease',
                                            opacity: isHovered ? 1 : 0.6
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentImageIndex !== index) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                                e.currentTarget.style.width = '12px';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentImageIndex !== index) {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)';
                                                e.currentTarget.style.width = '8px';
                                            }
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Quick View Overlay */}
                        <div
                            onClick={handleQuickView}
                            style={{
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                right: '0',
                                bottom: '0',
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isHovered ? '1' : '0',
                                transition: 'opacity 0.4s ease',
                                cursor: 'pointer',
                                zIndex: '10'
                            }}
                        >
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.95)',
                                padding: '10px 20px',
                                borderRadius: '25px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                                transition: 'transform 0.4s ease'
                            }}>
                                <Eye size={14} style={{ color: '#b8860b' }} />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#b8860b',
                                    letterSpacing: '0.5px'
                                }}>
                                    Quick View
                                </span>
                            </div>
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
                            padding: '30px'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.8)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <ShoppingCart size={24} style={{ color: '#9ca3af' }} />
                            </div>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                fontWeight: '500',
                                margin: '0'
                            }}>
                                {images.length === 0 ? 'No Images Available' : 'Image Load Error'}
                            </p>
                            <p style={{
                                fontSize: '10px',
                                color: '#9ca3af',
                                margin: '4px 0 0 0'
                            }}>
                                SKU: {product.sku || 'N/A'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Add to Cart Quick Button */}
                {product.stock > 0 && (
                    <button
                        onClick={handleAddToCart}
                        style={{
                            position: 'absolute',
                            bottom: hasMultipleImages ? '60px' : '20px',
                            right: '20px',
                            zIndex: '15',
                            background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                            color: 'white',
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            transform: isHovered ? 'scale(1)' : 'scale(0)',
                            opacity: isHovered ? '1' : '0',
                            boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(184, 134, 11, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isHovered) {
                                e.currentTarget.style.transform = 'scale(0)';
                            } else {
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.3)';
                        }}
                    >
                        <ShoppingCart size={18} />
                    </button>
                )}
            </div>

            {/* Product Details */}
            <div style={{
                padding: '24px',
                textAlign: 'center'
            }}>
                {/* Collection Label */}
                <h3 style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#b8860b',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    margin: '0 0 8px 0'
                }}>
                    JewelNest Collection
                </h3>

                {/* Product Name */}
                <h2 style={{
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
                    {product.name}
                </h2>

                {/* Image Counter for Mobile/Desktop */}
                {hasMultipleImages && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        opacity: 0.8
                    }}>
                        <ImageIcon size={12} color="#9ca3af" />
                        <span style={{
                            fontSize: '11px',
                            color: '#9ca3af',
                            fontWeight: '500'
                        }}>
                            {currentImageIndex + 1} of {images.length} views
                        </span>
                    </div>
                )}

                {/* Price Section */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    flexDirection: 'column'
                }}>
                    {/* Current Price */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px'
                    }}>
                        <span style={{
                            fontSize: '22px',
                            fontWeight: '800',
                            color: '#b8860b',
                            position: 'relative'
                        }}>
                            ₹{formatPrice(displayPrice)}
                            <span style={{
                                position: 'absolute',
                                bottom: '-4px',
                                left: '0',
                                right: '0',
                                height: '2px',
                                background: 'linear-gradient(90deg, #b8860b, transparent)',
                                borderRadius: '1px'
                            }}></span>
                        </span>

                        {/* Original Price (if different) */}
                        {originalPrice > displayPrice && (
                            <span style={{
                                fontSize: '14px',
                                color: '#9ca3af',
                                textDecoration: 'line-through'
                            }}>
                                ₹{formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>

                    {/* Discount Amount */}
                    {discountAmount > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(45deg, #dc2626, #ef4444)',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                        }}>
                            <span>Save ₹{formatPrice(discountAmount)}</span>
                            {discountPercentage > 0 && (
                                <span style={{
                                    fontSize: '10px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    padding: '2px 6px',
                                    borderRadius: '8px'
                                }}>
                                    {discountPercentage}% OFF
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Add to Bag Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: product.stock > 0 ? 'white' : '#e5e7eb',
                        color: product.stock > 0 ? '#b8860b' : '#9ca3af',
                        border: `2px solid ${product.stock > 0 ? '#b8860b' : '#d1d5db'}`,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '700',
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                        transition: product.stock > 0 ? 'all 0.3s ease' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                        if (product.stock > 0) {
                            e.currentTarget.style.background = '#b8860b';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.25)';
                            e.currentTarget.style.borderColor = '#b8860b';
                            // Show shine effect on hover
                            const shine = e.currentTarget.querySelector('span');
                            if (shine) {
                                shine.style.left = '100%';
                            }
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (product.stock > 0) {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#b8860b';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.borderColor = '#b8860b';
                            // Reset shine effect
                            const shine = e.currentTarget.querySelector('span');
                            if (shine) {
                                shine.style.left = '-100%';
                            }
                        }
                    }}
                >
                    <ShoppingCart size={14} />
                    <span>{product.stock > 0 ? 'Add to Bag' : 'Out of Stock'}</span>
                    {/* Button Shine Effect */}
                    {product.stock > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '0',
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                            transition: 'left 0.7s ease'
                        }}></span>
                    )}
                </button>

                {/* Sale Timer (if sale is active with end date) */}
                {isOnSale && product.saleEndDate && (
                    <div style={{
                        marginTop: '16px',
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

            {/* Hover Glow Effect */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                boxShadow: isHovered ? '0 25px 50px rgba(184, 134, 11, 0.2)' : 'none',
                borderRadius: '24px',
                transition: 'box-shadow 0.4s ease',
                pointerEvents: 'none'
            }}></div>

            {/* Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.05) 0%, transparent 50%)',
                opacity: isHovered ? '1' : '0',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none',
                borderRadius: '24px'
            }}></div>

            {/* Animated Border */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                borderRadius: '24px',
                padding: '2px',
                background: isHovered ? 'linear-gradient(135deg, #b8860b, #fbbf24, #b8860b)' : 'transparent',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                opacity: isHovered ? '1' : '0',
                transition: 'opacity 0.3s ease',
                pointerEvents: 'none'
            }}></div>
        </div>
    );
};

export default ProductCard;

// CSS Animations (add to your global styles or style tag)
<style>{`
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
    }
`}</style>