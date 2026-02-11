import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/common/Title';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Loader } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
    const {
        products,
        currency,
        cartItems,
        updateCartItemQuantity,
        getCartAmount,
        getProductCurrentPrice // 1. Get from Context for consistency
    } = useContext(ShopContext);

    const [cartData, setCartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const navigate = useNavigate();

    // 2. Optimized Cart Data Sync (Removed 500ms delay)
    useEffect(() => {
        const tempData = [];
        for (const items in cartItems) {
            if (cartItems[items] > 0) {
                tempData.push({
                    _id: items,
                    quantity: cartItems[items]
                });
            }
        }
        setCartData(tempData);
        setLoading(false);
    }, [cartItems]);

    // --- Quantity Handlers ---
    const handleIncrement = async (id, currentQty, stock) => {
        if (currentQty + 1 > stock) {
            toast.warning(`Only ${stock} items available in stock`);
            return;
        }
        updateCartItemQuantity(id, currentQty + 1);
    };

    const handleDecrement = (id, currentQty) => {
        if (currentQty <= 1) {
            updateCartItemQuantity(id, 0);
        } else {
            updateCartItemQuantity(id, currentQty - 1);
        }
    };

    const handleRemove = async (id) => {
        setRemovingId(id);
        // Animation delay before actual removal
        setTimeout(() => {
            updateCartItemQuantity(id, 0);
            setRemovingId(null);
        }, 300);
    };

    // Removed local getProductCurrentPrice, using Context version

    const calculateDiscount = () => {
        const total = getCartAmount();
        return total > 5000 ? total * 0.1 : 0;
    };

    const shippingFee = getCartAmount() > 499 ? 0 : 50;

    // 3. Helper to get the correct Image URL
    const resolveImageSrc = (product) => {
        if (!product) return '';

        // Priority 1: Check 'images' array (New multiple images format)
        if (product.images && product.images.length > 0) {
            const firstImg = product.images[0];
            return typeof firstImg === 'object' ? firstImg.url : firstImg;
        }

        // Priority 2: Check 'image' string/array (Old format)
        if (product.image) {
            return Array.isArray(product.image) ? product.image[0] : product.image;
        }

        return 'https://via.placeholder.com/150'; // Default fallback
    };

    // Loading State
    if (loading) {
        return (
            <div style={{
                minHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}>
                <div style={{
                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <ShoppingBag size={80} style={{ color: '#9ca3af' }} />
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: '6px solid #f3f3f3',
                        borderTop: '6px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#4b5563',
                        marginTop: '20px'
                    }}>Loading your precious items...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    if (cartData.length === 0) {
        return (
            <div style={{
                padding: '80px 20px',
                textAlign: 'center',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
            }}>
                <ShoppingBag size={80} style={{
                    marginBottom: '20px',
                    animation: 'bounce 2s infinite',
                    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
                }} />
                <h2 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    marginBottom: '10px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                }}>Your cart is feeling lonely!</h2>
                <p style={{
                    fontSize: '1.125rem',
                    opacity: '0.9',
                    marginBottom: '30px',
                    maxWidth: '500px'
                }}>Add some sparkling jewelry to light it up!</p>
                <Link
                    to="/collection"
                    style={{
                        background: 'white',
                        color: '#667eea',
                        padding: '16px 40px',
                        borderRadius: '50px',
                        fontWeight: '700',
                        fontSize: '1.125rem',
                        textDecoration: 'none',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        transform: 'translateY(0)',
                        display: 'inline-block'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                    }}
                >
                    Explore Jewelry Collection
                </Link>
                <style>{`
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-20px); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '40px 20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            minHeight: '100vh'
        }}>
            <Title text1={'SHOPPING'} text2={'CART'} />

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '40px',
                marginTop: '40px'
            }}>
                {/* Product List */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '25px'
                }}>
                    {cartData.map((item, index) => {
                        const productData = products.find(p => p._id === item._id);
                        if (!productData) return null;

                        const currentPrice = getProductCurrentPrice ? getProductCurrentPrice(productData) : (productData.price || 0);
                        const originalPrice = productData.price || 0;
                        const isSale = currentPrice < originalPrice;
                        const stock = productData.stock || 10;
                        const isRemoving = removingId === item._id;

                        return (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '25px',
                                    padding: '25px',
                                    backgroundColor: 'white',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                                    border: '2px solid transparent',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    animation: isRemoving ? 'slideOut 0.3s ease-out forwards' : 'slideIn 0.5s ease-out',
                                    animationDelay: `${index * 0.1}s`,
                                    opacity: isRemoving ? 0 : 1,
                                    transform: isRemoving ? 'translateX(-100%)' : 'translateX(0)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.borderColor = '#fbbf24';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                                    e.currentTarget.style.borderColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    borderRadius: '15px',
                                    flexShrink: 0
                                }}>
                                    <img
                                        src={resolveImageSrc(productData)}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s ease'
                                        }}
                                        alt={productData.name}
                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}>
                                        {item.quantity}x
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '8px'
                                    }}>{productData.name}</h3>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        flexWrap: 'wrap',
                                        marginBottom: '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '1.5rem',
                                            fontWeight: '800',
                                            color: '#ea580c',
                                            background: 'linear-gradient(45deg, #ea580c, #f97316)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            {currency}{currentPrice.toLocaleString()}
                                        </span>

                                        {isSale && (
                                            <>
                                                <span style={{
                                                    fontSize: '1rem',
                                                    color: '#9ca3af',
                                                    textDecoration: 'line-through'
                                                }}>
                                                    {currency}{originalPrice.toLocaleString()}
                                                </span>
                                                <span style={{
                                                    fontSize: '0.875rem',
                                                    background: 'linear-gradient(45deg, #ef4444, #dc2626)',
                                                    color: 'white',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontWeight: '700',
                                                    animation: 'pulse 1.5s infinite'
                                                }}>
                                                    SALE
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: '#6b7280',
                                        marginBottom: '4px'
                                    }}>
                                        SKU: {productData.sku}
                                    </p>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        color: stock > 5 ? '#10b981' : '#ef4444',
                                        fontWeight: '600'
                                    }}>
                                        Stock: {stock} units
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    background: 'white',
                                    borderRadius: '15px',
                                    overflow: 'hidden',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    border: '2px solid #e5e7eb'
                                }}>
                                    <button
                                        onClick={() => handleDecrement(item._id, item.quantity)}
                                        style={{
                                            padding: '12px 16px',
                                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'}
                                    >
                                        <Minus size={18} color="#374151" />
                                    </button>

                                    <span style={{
                                        padding: '0 20px',
                                        fontSize: '1.125rem',
                                        fontWeight: '800',
                                        color: '#1f2937',
                                        minWidth: '60px',
                                        textAlign: 'center'
                                    }}>
                                        {item.quantity}
                                    </span>

                                    <button
                                        onClick={() => handleIncrement(item._id, item.quantity, stock)}
                                        style={{
                                            padding: '12px 16px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#047857'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}
                                    >
                                        <Plus size={18} color="white" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleRemove(item._id)}
                                    disabled={isRemoving}
                                    style={{
                                        padding: '12px',
                                        background: isRemoving ? '#9ca3af' : 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        cursor: isRemoving ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.2)'
                                    }}
                                    onMouseEnter={(e) => !isRemoving && (e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)')}
                                    onMouseLeave={(e) => !isRemoving && (e.currentTarget.style.transform = 'scale(1) rotate(0)')}
                                >
                                    {isRemoving ? (
                                        <Loader size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <Trash2 size={22} color="#ef4444" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px',
                    borderRadius: '30px',
                    color: 'white',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'sticky',
                    top: '40px',
                    animation: 'float 3s ease-in-out infinite'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: '900',
                        marginBottom: '30px',
                        textAlign: 'center',
                        textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        Order Summary
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '15px',
                            borderBottom: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <span style={{ fontSize: '1.125rem', opacity: 0.9 }}>Subtotal</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                                {currency}{getCartAmount().toLocaleString()}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            animation: 'glow 2s infinite alternate'
                        }}>
                            <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Special Discount</span>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '800',
                                color: '#fbbf24',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                                -{currency}{calculateDiscount().toLocaleString()}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '15px 0',
                            borderTop: '1px solid rgba(255,255,255,0.2)',
                            borderBottom: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <span style={{ fontSize: '1.125rem', opacity: 0.9 }}>Shipping</span>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: shippingFee === 0 ? '#34d399' : 'white'
                            }}>
                                {shippingFee === 0 ? 'FREE 🎉' : `${currency}${shippingFee}`}
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '20px',
                            borderTop: '2px solid rgba(255,255,255,0.3)'
                        }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                                Total Amount
                            </span>
                            <span style={{
                                fontSize: '2.5rem',
                                fontWeight: '900',
                                background: 'linear-gradient(45deg, #fff, #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 4px 8px rgba(0,0,0,0.2)'
                            }}>
                                {currency}{(getCartAmount() - calculateDiscount() + shippingFee).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/place-order')}
                        style={{
                            width: '100%',
                            marginTop: '40px',
                            background: 'linear-gradient(45deg, #fbbf24 0%, #f59e0b 100%)',
                            color: '#1f2937',
                            padding: '20px',
                            borderRadius: '20px',
                            border: 'none',
                            fontSize: '1.25rem',
                            fontWeight: '800',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '15px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(251, 191, 36, 0.4)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(251, 191, 36, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(251, 191, 36, 0.4)';
                        }}
                    >
                        Proceed to Checkout
                        <ArrowRight size={24} style={{ transition: 'transform 0.3s ease' }} />
                    </button>

                    <p style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontSize: '0.875rem',
                        opacity: 0.8,
                        fontStyle: 'italic'
                    }}>
                        ⚡ Secure checkout · Free returns · 24/7 support
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes glow {
                    from {
                        text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fbbf24, 0 0 20px #fbbf24;
                    }
                    to {
                        text-shadow: 0 0 10px #fff, 0 0 20px #ffd700, 0 0 30px #ffd700, 0 0 40px #ffd700;
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                button:active {
                    transform: scale(0.95) !important;
                }
                
                @media (min-width: 1024px) {
                    div:first-of-type > div {
                        grid-template-columns: 2fr 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;