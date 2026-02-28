import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Timer, Tag, Sparkles, ShoppingCart, ChevronLeft, ChevronRight, Flame, Zap } from 'lucide-react';
import { ShopContext } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

const TodaySale = () => {
    const [saleProducts, setSaleProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImages, setCurrentImages] = useState({});

    const { addToCart, backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/products/all`);
                if (res.data.success && res.data.products) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const filtered = res.data.products.filter(p => {
                        if (!p.onSale || !p.saleStartDate || !p.saleEndDate) return false;

                        const startDate = new Date(p.saleStartDate);
                        const endDate = new Date(p.saleEndDate);
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(23, 59, 59, 999);

                        return today >= startDate && today <= endDate;
                    });

                    setSaleProducts(filtered);

                    // Initialize current image indices
                    const initialImages = {};
                    filtered.forEach(product => {
                        initialImages[product._id] = 0;
                    });
                    setCurrentImages(initialImages);

                    if (filtered.length === 0) {
                        toast.info("No sales active today");
                    }
                } else {
                    toast.error("Failed to load products");
                }
            } catch (err) {
                console.error("Error fetching sale products:", err);
                toast.error(err.response?.data?.message || "Failed to load sale items");
            } finally {
                setLoading(false);
            }
        };
        fetchSaleProducts();
    }, [backendUrl]);

    const handleAddToCart = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(item._id);
        toast.success(`${item.name} added to cart!`, {
            position: "bottom-right",
            autoClose: 2000,
            icon: "🛒"
        });
    };

    const nextImage = (e, productId, totalImages) => {
        e.stopPropagation();
        setCurrentImages(prev => ({
            ...prev,
            [productId]: (prev[productId] + 1) % totalImages
        }));
    };

    const prevImage = (e, productId, totalImages) => {
        e.stopPropagation();
        setCurrentImages(prev => ({
            ...prev,
            [productId]: (prev[productId] - 1 + totalImages) % totalImages
        }));
    };

    if (loading) return (
        <div style={{
            height: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '40px',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '30px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{
                    fontSize: '60px',
                    animation: 'pulse 1.5s infinite',
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>✨</div>
                <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    marginTop: '20px',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                }}>Loading Today's Sparkling Deals...</div>
            </div>
        </div>
    );

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '20px',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
            {/* Premium Banner */}
            <div style={{
                background: 'linear-gradient(90deg, #FF416C 0%, #FF4B2B 100%)',
                borderRadius: '30px',
                padding: '40px',
                marginBottom: '40px',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 20px 40px rgba(255, 65, 108, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '-50px',
                    right: '-50px',
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%'
                }}></div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        fontSize: '50px',
                        animation: 'spin 3s linear infinite'
                    }}>💎</div>
                    <div>
                        <h1 style={{
                            fontSize: '48px',
                            fontWeight: '900',
                            letterSpacing: '-1px',
                            margin: '0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}>
                            <Flame style={{ animation: 'pulse 1s infinite' }} />
                            FLASH SALE TODAY
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            opacity: '0.9',
                            marginTop: '10px',
                            fontStyle: 'italic'
                        }}>Limited-time exclusive offers on high-end jewelry</p>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    marginTop: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        padding: '15px 30px',
                        borderRadius: '50px',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>
                        <Timer style={{ animation: 'pulse 1.5s infinite' }} />
                        <div>
                            <div style={{ fontSize: '12px', opacity: '0.8' }}>ENDS IN</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>24:00:00</div>
                        </div>
                    </div>

                    <div
                        onClick={() => navigate('/collection')}
                        style={{
                            padding: '10px 25px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50px',
                            color: '#FF416C',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            letterSpacing: '1px',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            ':hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
                            }
                        }}
                    >
                        SHOP NOW
                    </div>
                </div>
            </div>

            {saleProducts.length > 0 ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '30px',
                    padding: '20px'
                }}>
                    {saleProducts.map((item) => {
                        const discount = Math.round(((item.originalPrice - item.salePrice) / item.originalPrice) * 100);
                        const images = Array.isArray(item.images)
                            ? item.images.map((img) => (typeof img === 'string' ? img : img?.url)).filter(Boolean)
                            : Array.isArray(item.image)
                                ? item.image
                                : typeof item.image === 'string'
                                    ? [item.image]
                                    : [];
                        const currentImageIndex = currentImages[item._id] || 0;
                        const imageSrc = images[currentImageIndex] || '';
                        const isMultiImage = images.length > 1;

                        return (
                            <div key={item._id}
                                onClick={() => navigate(`/product/${item._id}`)}
                                style={{
                                    background: 'white',
                                    borderRadius: '25px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    ':hover': {
                                        transform: 'translateY(-10px)',
                                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
                                    }
                                }}>
                                {/* Discount Ribbon */}
                                <div style={{
                                    position: 'absolute',
                                    top: '20px',
                                    left: '20px',
                                    background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: '900',
                                    zIndex: '10',
                                    boxShadow: '0 5px 15px rgba(255, 65, 108, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <Zap size={14} />
                                    {discount}% OFF
                                </div>

                                {/* Image Gallery */}
                                <div style={{
                                    height: '280px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    background: '#f8f9fa'
                                }}>
                                    {imageSrc && (
                                        <img
                                            src={imageSrc}
                                            alt={item.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.05)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                            }}
                                        />
                                    )}

                                    {/* Image Navigation */}
                                    {isMultiImage && (
                                        <>
                                            <button
                                                onClick={(e) => prevImage(e, item._id, images.length)}
                                                style={{
                                                    position: 'absolute',
                                                    left: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.3s',
                                                    ':hover': {
                                                        background: 'white',
                                                        transform: 'translateY(-50%) scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <ChevronLeft size={20} />
                                            </button>

                                            <button
                                                onClick={(e) => nextImage(e, item._id, images.length)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    border: 'none',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    transition: 'all 0.3s',
                                                    ':hover': {
                                                        background: 'white',
                                                        transform: 'translateY(-50%) scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <ChevronRight size={20} />
                                            </button>

                                            {/* Image Dots Indicator */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '15px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                display: 'flex',
                                                gap: '8px'
                                            }}>
                                                {images.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            width: index === currentImageIndex ? '20px' : '8px',
                                                            height: '8px',
                                                            borderRadius: '4px',
                                                            background: index === currentImageIndex ? '#FF416C' : 'rgba(255, 255, 255, 0.6)',
                                                            transition: 'all 0.3s',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCurrentImages(prev => ({
                                                                ...prev,
                                                                [item._id]: index
                                                            }));
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Product Details */}
                                <div style={{
                                    padding: '25px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px'
                                    }}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: '#FF416C',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}>
                                            {item.category}
                                        </span>
                                    </div>

                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: '800',
                                        color: '#1f2937',
                                        marginBottom: '15px',
                                        lineHeight: '1.4'
                                    }}>
                                        {item.name}
                                    </h3>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'baseline',
                                        gap: '15px',
                                        marginBottom: '25px'
                                    }}>
                                        <span style={{
                                            fontSize: '28px',
                                            fontWeight: '900',
                                            color: '#111827',
                                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            ₹{item.salePrice.toLocaleString()}
                                        </span>
                                        <span style={{
                                            fontSize: '16px',
                                            color: '#9ca3af',
                                            textDecoration: 'line-through'
                                        }}>
                                            ₹{item.originalPrice.toLocaleString()}
                                        </span>
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            color: '#10b981',
                                            background: '#d1fae5',
                                            padding: '4px 8px',
                                            borderRadius: '12px'
                                        }}>
                                            Save ₹{(item.originalPrice - item.salePrice).toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={(e) => handleAddToCart(e, item)}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '15px',
                                            fontWeight: 'bold',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            ':hover': {
                                                background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)'
                                            },
                                            ':active': {
                                                transform: 'translateY(0)'
                                            }
                                        }}
                                    >
                                        <ShoppingCart size={18} />
                                        ADD TO CART
                                    </button>
                                </div>

                                {/* Hot Deal Badge */}
                                {discount > 50 && (
                                    <div style={{
                                        position: 'absolute',
                                        right: '-30px',
                                        top: '40%',
                                        background: '#FF416C',
                                        color: 'white',
                                        padding: '8px 40px',
                                        fontSize: '12px',
                                        fontWeight: '900',
                                        transform: 'rotate(45deg)',
                                        boxShadow: '0 5px 15px rgba(255, 65, 108, 0.3)'
                                    }}>
                                        HOT DEAL
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '30px',
                    marginTop: '40px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '200px',
                        opacity: '0.1'
                    }}>💎</div>

                    <Timer size={80} style={{
                        margin: '0 auto 20px',
                        animation: 'pulse 2s infinite'
                    }} />
                    <h2 style={{
                        fontSize: '36px',
                        fontWeight: '900',
                        marginBottom: '15px'
                    }}>No Active Sales Right Now</h2>
                    <p style={{
                        fontSize: '18px',
                        opacity: '0.9',
                        maxWidth: '500px',
                        margin: '0 auto 30px',
                        lineHeight: '1.6'
                    }}>
                        Great deals are being prepared! Come back tomorrow for exclusive offers on high-quality jewelry.
                    </p>
                    <button
                        onClick={() => navigate('/collection')}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            border: '2px solid rgba(255, 255, 255, 0.3)',
                            padding: '15px 40px',
                            borderRadius: '25px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backdropFilter: 'blur(10px)',
                            transition: 'all 0.3s',
                            ':hover': {
                                background: 'rgba(255, 255, 255, 0.3)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        EXPLORE ALL PRODUCTS
                    </button>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default TodaySale;