import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { Star, Check, Truck, Shield, Clock, Package, Sparkles, Gem, Crown, ShoppingBag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import RelatedProducts from '../components/product/RelatedProducts';

const Product = () => {
    const { productId } = useParams();
    const { products, currency, addToCart, backendUrl, token, user } = useContext(ShopContext);
    const [productData, setProductData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showAlert, setShowAlert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    // --- VARIANT STATES ---
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    const fetchProductData = async () => {
        setLoading(true);
        const product = products.find(item => item._id === productId);
        setProductData(product);
        setLoading(false);
    }

    useEffect(() => {
        fetchProductData();
        setSelectedColor(null);
        setSelectedSize(null);
    }, [productId, products]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId || !backendUrl) return;
            try {
                setReviewLoading(true);
                const res = await axios.get(`${backendUrl}/api/reviews/product/${productId}`);
                setReviews(res.data?.reviews || []);
            } catch {
                setReviews([]);
            } finally {
                setReviewLoading(false);
            }
        };
        fetchReviews();
    }, [productId, backendUrl]);

    const submitReview = async () => {
        if (!token) return toast.error('Please login to review.');
        if (!reviewRating || !reviewText.trim()) return toast.error('Please add rating and review.');

        try {
            setReviewSubmitting(true);
            const res = await axios.post(
                `${backendUrl}/api/reviews`,
                { productId, rating: reviewRating, text: reviewText.trim() },
                { headers: { token } }
            );
            if (res.data?.review) {
                setReviews((prev) => [res.data.review, ...prev]);
                setReviewText('');
                setReviewRating(0);
            }
        } catch (e) {
            toast.error('Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleAddToCart = async () => {
        if (!productData?._id) {
            toast.error("Product not found");
            return;
        }

        // Variant validation
        if (productData.hasVariants && productData.variants?.length > 0) {
            if (!selectedColor) {
                toast.error("Please select a color");
                return;
            }
            if (!selectedSize) {
                toast.error("Please select a size");
                return;
            }
        }

        if (isAddingToCart) return;
        setIsAddingToCart(true);

        try {
            if (productData.hasVariants && selectedColor && selectedSize) {
                // Find the selected variant
                const variant = productData.variants.find(v => v.color === selectedColor);
                const sizeEntry = variant?.sizes?.find(s => s.size === selectedSize);
                const variantImage = variant?.images?.[0]?.url || variant?.images?.[0] || '';

                for (let i = 0; i < quantity; i++) {
                    addToCart(productData._id, {
                        selectedColor,
                        selectedSize,
                        variantImage,
                        variantSku: variant?.sku || '',
                        priceAdjustment: sizeEntry?.priceAdjustment || 0
                    });
                }
            } else {
                // Non-variant product
                for (let i = 0; i < quantity; i++) {
                    addToCart(productData._id);
                }
            }

            setShowAlert('success');
            setTimeout(() => setShowAlert(null), 3000);
            setQuantity(1);

        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error("Failed to add to cart", { position: "top-right", autoClose: 2000 });
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    // --- VARIANT-AWARE IMAGE LOGIC ---
    const getDisplayImages = () => {
        if (productData?.hasVariants && productData?.variants?.length > 0 && selectedColor) {
            const variant = productData.variants.find(v => v.color === selectedColor);
            if (variant?.images?.length > 0) {
                return variant.images.map(img => typeof img === 'object' ? img.url : img);
            }
        }
        // Fallback to main product images
        return productData?.images?.length
            ? productData.images.map((img) => img.url)
            : productData?.image
                ? (Array.isArray(productData.image) ? productData.image : [productData.image])
                : [];
    };
    const productImages = getDisplayImages();

    // Get selected variant for price adjustment
    const getSelectedVariant = () => {
        if (!productData?.hasVariants || !selectedColor) return null;
        return productData.variants.find(v => v.color === selectedColor);
    };
    const selectedVariant = getSelectedVariant();

    const getSelectedSizeEntry = () => {
        if (!selectedVariant || !selectedSize) return null;
        return selectedVariant.sizes.find(s => s.size === selectedSize);
    };
    const selectedSizeEntry = getSelectedSizeEntry();

    // Check if variant product needs both color and size
    const isVariantProduct = productData?.hasVariants && productData?.variants?.length > 0;
    const canAddToCart = isVariantProduct ? (selectedColor && selectedSize) : true;

    if (loading) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto'
                }}>
                    <div className="product-main-grid">
                        {/* Image Skeleton */}
                        <div>
                            <div
                                className="product-skeleton-img"
                                style={{
                                    background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                                    backgroundSize: '200% 100%',
                                    animation: 'loading 1.5s infinite',
                                }}
                            ></div>
                        </div>

                        {/* Info Skeleton */}
                        <div>
                            <div style={{
                                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'loading 1.5s infinite',
                                borderRadius: '12px',
                                height: '40px',
                                width: '70%',
                                marginBottom: '20px'
                            }}></div>
                            <div style={{
                                background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'loading 1.5s infinite',
                                borderRadius: '12px',
                                height: '60px',
                                width: '40%',
                                marginBottom: '30px'
                            }}></div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes loading {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>
            </div>
        );
    }

    if (!productData) {
        return (
            <div style={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    maxWidth: '600px'
                }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 30px'
                    }}>
                        <Package size={48} style={{ color: '#9ca3af' }} />
                    </div>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1a202c',
                        marginBottom: '16px'
                    }}>
                        Product Not Found
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: '#6b7280',
                        marginBottom: '32px',
                        lineHeight: '1.6'
                    }}>
                        The product you're looking for doesn't exist or has been removed from our collection.
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        style={{
                            background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                            color: 'white',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-3px)';
                            e.target.style.boxShadow = '0 15px 30px rgba(184, 134, 11, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        Back to Shop
                    </button>
                </div>
            </div>
        );
    }

    const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length)
        : 0;

    const isOnSale = Boolean(productData?.onSale && productData?.salePrice);
    const displayPrice = isOnSale ? productData.salePrice : productData?.price;
    const originalPrice = productData?.originalPrice ?? productData?.price;
    const savings = (originalPrice ?? 0) - (displayPrice ?? 0);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            minHeight: '100vh',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Product Header */}
                <div style={{
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Sparkles size={24} style={{ color: '#b8860b' }} />
                    <h1 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#b8860b',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        margin: 0
                    }}>
                        Exclusive Collection
                    </h1>
                </div>

                {/* Product Main Content */}
                <div
                    className="product-main-grid"
                    style={{
                        marginBottom: '80px'
                    }}
                >
                    {/* Product Images */}
                    <div>
                        {/* Main Image */}
                        <div style={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            marginBottom: '20px',
                            position: 'relative',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
                        }}>
                            <img
                                src={productImages[selectedImage] || productImages[0]}
                                alt={productData.name}
                                className="product-main-img"
                                style={{
                                    objectFit: 'cover',
                                    transition: 'transform 0.3s ease',
                                    cursor: 'zoom-in'
                                }}
                                onClick={() => setIsImageZoomed(true)}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)';
                                }}
                            />
                        </div>

                        {/* Image Thumbnails */}
                        {productImages.length > 1 && (
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                overflowX: 'auto',
                                paddingBottom: '10px'
                            }}>
                                {productImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: `2px solid ${selectedImage === index ? '#b8860b' : '#e5e7eb'}`,
                                            background: 'none',
                                            cursor: 'pointer',
                                            padding: '0',
                                            flexShrink: 0,
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedImage !== index) {
                                                e.currentTarget.style.borderColor = '#d1d5db';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedImage !== index) {
                                                e.currentTarget.style.borderColor = '#e5e7eb';
                                            }
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`${productData.name} view ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div>
                        {/* Product Title */}
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: '300',
                            color: '#1a202c',
                            marginBottom: '16px',
                            lineHeight: '1.3'
                        }}>
                            {productData.name}
                        </h1>

                        {/* Rating */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '24px'
                        }}>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <Star
                                        key={n}
                                        size={20}
                                        style={{
                                            color: n <= Math.round(avgRating) ? '#fbbf24' : '#d1d5db',
                                            fill: n <= Math.round(avgRating) ? '#fbbf24' : 'none'
                                        }}
                                    />
                                ))}
                            </div>
                            <span style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                fontWeight: '500'
                            }}>
                                {avgRating ? avgRating.toFixed(1) : '0.0'} ({reviews.length} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div style={{
                            marginBottom: '32px',
                            paddingBottom: '32px',
                            borderBottom: '2px solid #f3f4f6'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '16px',
                                marginBottom: '8px'
                            }}>
                                <span style={{
                                    fontSize: '48px',
                                    fontWeight: '700',
                                    color: '#b8860b'
                                }}>
                                    {currency}{displayPrice}
                                </span>
                                {originalPrice && originalPrice > displayPrice && (
                                    <span style={{
                                        fontSize: '24px',
                                        color: '#9ca3af',
                                        textDecoration: 'line-through'
                                    }}>
                                        {currency}{originalPrice}
                                    </span>
                                )}
                            </div>
                            {originalPrice && originalPrice > displayPrice && (
                                <span style={{
                                    fontSize: '14px',
                                    color: '#10b981',
                                    fontWeight: '600',
                                    background: '#d1fae5',
                                    padding: '4px 12px',
                                    borderRadius: '20px'
                                }}>
                                    Save {currency}{savings}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '12px'
                            }}>
                                Description
                            </h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                lineHeight: '1.8'
                            }}>
                                {productData.description || "This exquisitely crafted jewelry piece embodies timeless elegance and sophistication."}
                            </p>
                        </div>

                        {/* --- COLOR SWATCHES --- */}
                        {isVariantProduct && (
                            <div style={{
                                marginBottom: '32px',
                                paddingBottom: '32px',
                                borderBottom: '2px solid #f3f4f6'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '16px'
                                }}>
                                    Color {selectedColor && <span style={{ color: '#b8860b', fontWeight: '700' }}>— {selectedColor}</span>}
                                </h3>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    {productData.variants.map((variant) => {
                                        const isActive = selectedColor === variant.color;
                                        // Get first image of this variant for the thumbnail
                                        const firstImg = variant.images?.[0];
                                        const swatchImage = firstImg ? (typeof firstImg === 'object' ? firstImg.url : firstImg) : null;

                                        return (
                                            <button
                                                key={variant.color}
                                                onClick={() => {
                                                    setSelectedColor(variant.color);
                                                    setSelectedSize(null);
                                                    setSelectedImage(0);
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    padding: '4px'
                                                }}
                                            >
                                                <div style={{
                                                    width: '64px',
                                                    height: '64px',
                                                    borderRadius: '14px',
                                                    overflow: 'hidden',
                                                    border: isActive ? '3px solid #b8860b' : '2px solid #e5e7eb',
                                                    boxShadow: isActive ? '0 0 0 3px rgba(184, 134, 11, 0.25), 0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
                                                    transition: 'all 0.3s ease',
                                                    transform: isActive ? 'scale(1.08)' : 'scale(1)',
                                                    position: 'relative',
                                                    background: '#f3f4f6'
                                                }}>
                                                    {swatchImage ? (
                                                        <img
                                                            src={swatchImage}
                                                            alt={variant.color}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            background: '#d1d5db',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '10px',
                                                            color: '#6b7280'
                                                        }}>
                                                            {variant.color?.[0]}
                                                        </div>
                                                    )}
                                                    {/* Selected overlay with checkmark */}
                                                    {isActive && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            background: 'rgba(184, 134, 11, 0.35)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '12px'
                                                        }}>
                                                            <div style={{
                                                                width: '26px',
                                                                height: '26px',
                                                                borderRadius: '50%',
                                                                background: '#b8860b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                                                            }}>
                                                                <Check size={16} style={{ color: 'white' }} />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <span style={{
                                                    fontSize: '12px',
                                                    fontWeight: isActive ? '700' : '500',
                                                    color: isActive ? '#b8860b' : '#6b7280',
                                                    maxWidth: '70px',
                                                    textAlign: 'center',
                                                    lineHeight: '1.2'
                                                }}>
                                                    {variant.color}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* --- SIZE BUTTONS --- */}
                        {isVariantProduct && selectedColor && (
                            <div style={{
                                marginBottom: '32px',
                                paddingBottom: '32px',
                                borderBottom: '2px solid #f3f4f6'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '16px'
                                }}>
                                    Size {selectedSize && <span style={{ color: '#b8860b', fontWeight: '700' }}>— {selectedSize}</span>}
                                </h3>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {selectedVariant?.sizes?.map((sizeObj) => {
                                        const isActive = selectedSize === sizeObj.size;
                                        const isOutOfStock = sizeObj.stock <= 0;

                                        return (
                                            <button
                                                key={sizeObj.size}
                                                onClick={() => !isOutOfStock && setSelectedSize(sizeObj.size)}
                                                disabled={isOutOfStock}
                                                style={{
                                                    padding: '10px 20px',
                                                    borderRadius: '10px',
                                                    border: isActive ? '2px solid #b8860b' : '2px solid #e5e7eb',
                                                    background: isOutOfStock ? '#f3f4f6' : isActive ? 'linear-gradient(45deg, #fef3c7, #fde68a)' : 'white',
                                                    color: isOutOfStock ? '#9ca3af' : isActive ? '#92400e' : '#374151',
                                                    fontWeight: isActive ? '700' : '500',
                                                    fontSize: '14px',
                                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.3s ease',
                                                    textDecoration: isOutOfStock ? 'line-through' : 'none',
                                                    opacity: isOutOfStock ? 0.5 : 1,
                                                    position: 'relative',
                                                    minWidth: '60px'
                                                }}
                                            >
                                                {sizeObj.size}
                                                {isOutOfStock && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        background: '#ef4444',
                                                        color: 'white',
                                                        fontSize: '8px',
                                                        fontWeight: '700',
                                                        padding: '2px 6px',
                                                        borderRadius: '10px'
                                                    }}>
                                                        OUT
                                                    </span>
                                                )}
                                                {sizeObj.priceAdjustment !== 0 && !isOutOfStock && (
                                                    <span style={{
                                                        display: 'block',
                                                        fontSize: '10px',
                                                        color: sizeObj.priceAdjustment > 0 ? '#ef4444' : '#10b981',
                                                        marginTop: '2px'
                                                    }}>
                                                        {sizeObj.priceAdjustment > 0 ? '+' : ''}{currency}{sizeObj.priceAdjustment}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                {selectedSizeEntry && selectedSizeEntry.stock > 0 && selectedSizeEntry.stock <= 5 && (
                                    <p style={{
                                        marginTop: '8px',
                                        fontSize: '13px',
                                        color: '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        ⚡ Only {selectedSizeEntry.stock} left in stock!
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div style={{
                            marginBottom: '32px',
                            paddingBottom: '32px',
                            borderBottom: '2px solid #f3f4f6'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '16px'
                            }}>
                                Quantity
                            </h3>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: '#f9fafb',
                                    padding: '12px',
                                    borderRadius: '12px'
                                }}>
                                    <button
                                        onClick={() => handleQuantityChange('decrease')}
                                        disabled={quantity <= 1}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            border: '1px solid #d1d5db',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: quantity <= 1 ? '#9ca3af' : '#374151',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (quantity > 1) {
                                                e.target.style.borderColor = '#b8860b';
                                                e.target.style.color = '#b8860b';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (quantity > 1) {
                                                e.target.style.borderColor = '#d1d5db';
                                                e.target.style.color = '#374151';
                                            }
                                        }}
                                    >
                                        -
                                    </button>
                                    <span style={{
                                        minWidth: '40px',
                                        textAlign: 'center',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1a202c'
                                    }}>
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange('increase')}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            border: '1px solid #d1d5db',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '20px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.borderColor = '#b8860b';
                                            e.target.style.color = '#b8860b';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.borderColor = '#d1d5db';
                                            e.target.style.color = '#374151';
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280'
                                }}>
                                    {quantity} {quantity === 1 ? 'piece' : 'pieces'} selected
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            marginBottom: '32px'
                        }}>
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart || (isVariantProduct && !canAddToCart)}
                                style={{
                                    flex: 1,
                                    background: (!canAddToCart && isVariantProduct) ? '#e5e7eb' : 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                    color: (!canAddToCart && isVariantProduct) ? '#9ca3af' : 'white',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    cursor: (isAddingToCart || (isVariantProduct && !canAddToCart)) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    opacity: isAddingToCart ? 0.6 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!isAddingToCart && canAddToCart) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 15px 30px rgba(184, 134, 11, 0.3)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isAddingToCart && canAddToCart) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {isAddingToCart ? (
                                    <>
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            border: '3px solid rgba(255,255,255,0.3)',
                                            borderTopColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Adding...
                                    </>
                                ) : (isVariantProduct && !canAddToCart) ? (
                                    <>
                                        <ShoppingBag size={20} />
                                        {!selectedColor ? 'Select a Color' : 'Select a Size'}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag size={20} />
                                        Add to Cart {quantity > 1 && `(${quantity})`}
                                        {selectedSizeEntry?.priceAdjustment ? ` — ${currency}${displayPrice + selectedSizeEntry.priceAdjustment}` : ''}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Success Alert */}
                        {showAlert === 'success' && (
                            <div style={{
                                background: '#d1fae5',
                                color: '#065f46',
                                padding: '16px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                animation: 'slideIn 0.5s ease'
                            }}>
                                <Check size={20} />
                                <div>
                                    <p style={{ margin: 0, fontWeight: '600' }}>Added to cart successfully!</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                        {quantity} {quantity === 1 ? 'item' : 'items'} added to your shopping bag
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Product Features */}
                        <div style={{
                            background: '#f9fafb',
                            borderRadius: '16px',
                            padding: '24px',
                            marginBottom: '32px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '20px'
                            }}>
                                Product Features
                            </h3>
                            <div className="features-grid">
                                {[
                                    { icon: Gem, label: 'High Quality', desc: '100% Authentic Materials' },
                                    { icon: Shield, label: 'Secure Payment', desc: 'SSL Encrypted Checkout' },
                                    { icon: Truck, label: 'Free Shipping', desc: '3-5 Business Days' }
                                ].map((feature, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(45deg, #fef3c7, #fde68a)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <feature.icon size={20} style={{ color: '#b8860b' }} />
                                        </div>
                                        <div>
                                            <p style={{
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: '#1a202c',
                                                margin: '0 0 4px 0'
                                            }}>
                                                {feature.label}
                                            </p>
                                            <p style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                margin: 0
                                            }}>
                                                {feature.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            padding: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#374151',
                                marginBottom: '20px'
                            }}>
                                Product Details
                            </h3>
                            <div className="details-grid">
                                <div>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        margin: '0 0 4px 0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        SKU
                                    </p>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1a202c',
                                        margin: 0
                                    }}>
                                        {productData.sku || 'JN-001'}
                                    </p>
                                </div>
                                <div>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        margin: '0 0 4px 0',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px'
                                    }}>
                                        Sub Category
                                    </p>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1a202c',
                                        margin: 0
                                    }}>
                                        {productData.subCategory || 'Necklace'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <RelatedProducts
                    category={productData.subCategory}
                    products={products}
                    currentProductId={productData._id}
                />

                {/* Reviews Section */}
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto 60px',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '32px',
                    border: '1px solid #e5e7eb'
                }}>
                    <h3 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        marginBottom: '16px'
                    }}>
                        Reviews
                    </h3>

                    {/* Review Form */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setReviewRating(n)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                >
                                    <Star size={20} style={{ color: n <= reviewRating ? '#fbbf24' : '#d1d5db', fill: n <= reviewRating ? '#fbbf24' : 'none' }} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Write your review..."
                            rows={4}
                            style={{
                                width: '100%',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '12px',
                                fontSize: '14px',
                                marginBottom: '12px'
                            }}
                        />
                        <button
                            onClick={submitReview}
                            disabled={reviewSubmitting}
                            style={{
                                background: '#b8860b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 16px',
                                cursor: reviewSubmitting ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>

                    {/* Review List */}
                    {reviewLoading ? (
                        <div>Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div>No reviews yet.</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {reviews.map((r) => (
                                <div key={r._id} style={{ borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <Star key={n} size={16} style={{ color: n <= r.rating ? '#fbbf24' : '#d1d5db', fill: n <= r.rating ? '#fbbf24' : 'none' }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                                        {r.userName || user?.name || 'User'}
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#374151' }}>{r.text}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Image Zoom Modal */}
            {isImageZoomed && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease'
                    }}
                    onClick={() => setIsImageZoomed(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsImageZoomed(false)}
                        style={{
                            position: 'absolute',
                            top: '30px',
                            right: '30px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '12px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            zIndex: 10001
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'rotate(90deg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'rotate(0deg)';
                        }}
                    >
                        <X size={24} />
                    </button>

                    {/* Navigation Arrows */}
                    {productImages.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
                                }}
                                style={{
                                    position: 'absolute',
                                    left: '40px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '16px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    zIndex: 10000
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            >
                                <ChevronLeft size={32} />
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImage((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
                                }}
                                style={{
                                    position: 'absolute',
                                    right: '40px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    padding: '16px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    zIndex: 10000
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}

                    {/* Main Enlarged Image */}
                    <div
                        style={{
                            position: 'relative',
                            maxWidth: '85vw',
                            maxHeight: '75vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={productImages[selectedImage] || productImages[0]}
                            alt={productData.name}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '75vh',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
                                animation: 'scaleUp 0.3s ease-out'
                            }}
                        />
                    </div>

                    {/* Modal Thumbnails */}
                    {productImages.length > 1 && (
                        <div
                            style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '40px',
                                padding: '10px 20px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                zIndex: 10000
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {productImages.map((img, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: `2px solid ${selectedImage === index ? '#fbbf24' : 'transparent'}`,
                                        background: 'none',
                                        cursor: 'pointer',
                                        padding: '0',
                                        transition: 'all 0.3s ease',
                                        opacity: selectedImage === index ? 1 : 0.6
                                    }}
                                >
                                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    <style>{`
                        @keyframes scaleUp {
                            from { transform: scale(0.9); opacity: 0; }
                            to { transform: scale(1); opacity: 1; }
                        }
                    `}</style>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                /* Main Grid Layout */
                .product-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 60px;
                }

                /* Features Grid */
                .features-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                /* Details Grid */
                .details-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }

                /* Image Styles */
                .product-main-img {
                    width: 100%;
                    height: 500px;
                }

                .product-skeleton-img {
                    border-radius: 24px;
                    height: 500px;
                    margin-bottom: 20px;
                }

                /* Responsive Styles */
                @media (max-width: 1024px) {
                    .product-main-grid {
                        gap: 40px;
                    }
                }

                @media (max-width: 768px) {
                    .product-main-grid {
                        grid-template-columns: 1fr;
                        gap: 40px;
                    }

                    .features-grid {
                        grid-template-columns: 1fr;
                    }

                    .details-grid {
                        grid-template-columns: 1fr;
                    }

                    .product-main-img {
                        height: 350px;
                    }

                    .product-skeleton-img {
                        height: 350px;
                    }
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(-10px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Product;