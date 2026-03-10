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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // 2. Optimized Cart Data Sync - handles both variant (object) and non-variant (number) entries
    useEffect(() => {
        const tempData = [];
        for (const key in cartItems) {
            const entry = cartItems[key];
            if (typeof entry === 'object' && entry.quantity > 0) {
                // Variant item
                tempData.push({
                    _id: key,
                    productId: entry.productId,
                    quantity: entry.quantity,
                    selectedColor: entry.selectedColor,
                    selectedSize: entry.selectedSize,
                    variantImage: entry.variantImage,
                    variantSku: entry.variantSku,
                    priceAdjustment: entry.priceAdjustment || 0
                });
            } else if (typeof entry === 'number' && entry > 0) {
                // Non-variant item (legacy)
                tempData.push({
                    _id: key,
                    productId: key,
                    quantity: entry
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

    // 3. Helper to get the correct Image URL (variant-aware)
    const resolveImageSrc = (product, item) => {
        // Priority 0: Variant image from cart entry
        if (item?.variantImage) return item.variantImage;

        if (!product) return '';

        // Priority 1: Check 'images' array
        if (product.images && product.images.length > 0) {
            const firstImg = product.images[0];
            return typeof firstImg === 'object' ? firstImg.url : firstImg;
        }

        // Priority 2: Check 'image' string/array
        if (product.image) {
            return Array.isArray(product.image) ? product.image[0] : product.image;
        }

        return 'https://placehold.co/150';
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
            <div className="empty-cart-container" style={{
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
                    @media (max-width: 640px) {
                        .empty-cart-container h2 { font-size: 1.8rem !important; }
                        .empty-cart-container p { font-size: 1rem !important; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            <Title text1={'SHOPPING'} text2={'CART'} />

            <div className="cart-layout">
                {/* Product List */}
                <div className="cart-items-list">
                    {cartData.map((item, index) => {
                        const productData = products.find(p => p._id === (item.productId || item._id));
                        if (!productData) return null;

                        const basePrice = getProductCurrentPrice ? getProductCurrentPrice(productData) : (productData.price || 0);
                        const priceAdj = item.priceAdjustment || 0;
                        const currentPrice = basePrice + priceAdj;
                        const originalPrice = productData.price || 0;
                        const isSale = currentPrice < originalPrice;
                        const stock = productData.stock || 10;
                        const isRemoving = removingId === item._id;

                        return (
                            <div
                                key={index}
                                className={`cart-item ${isRemoving ? 'removing' : ''}`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                }}
                            >
                                <div className="cart-item-image-wrapper">
                                    <img
                                        src={resolveImageSrc(productData, item)}
                                        className="cart-item-image"
                                        alt={productData.name}
                                    />
                                    <div className="cart-item-qty-badge">
                                        {item.quantity}x
                                    </div>
                                </div>

                                <div className="cart-item-details">
                                    <h3 className="product-name">{productData.name}</h3>

                                    {/* Variant Info Badges */}
                                    {(item.selectedColor || item.selectedSize) && (
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                            {item.selectedColor && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: '#92400e',
                                                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid #fbbf24'
                                                }}>
                                                    🎨 {item.selectedColor}
                                                </span>
                                            )}
                                            {item.selectedSize && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    color: '#1e40af',
                                                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    border: '1px solid #93c5fd'
                                                }}>
                                                    📐 Size: {item.selectedSize}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="product-price-container">
                                        <span className="current-price">
                                            {currency}{currentPrice.toLocaleString()}
                                        </span>

                                        {isSale && (
                                            <>
                                                <span className="original-price">
                                                    {currency}{originalPrice.toLocaleString()}
                                                </span>
                                                <span className="sale-badge">
                                                    SALE
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <p className="product-meta">
                                        SKU: {item.variantSku || productData.sku}
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
                                <div className="cart-item-actions">
                                    <div className="quantity-controls">
                                        <button
                                            onClick={() => handleDecrement(item._id, item.quantity)}
                                            className="qty-btn"
                                        >
                                            <Minus size={18} color="#374151" />
                                        </button>

                                        <span className="qty-display">
                                            {item.quantity}
                                        </span>

                                        <button
                                            onClick={() => handleIncrement(item._id, item.quantity, stock)}
                                            className="qty-btn increment"
                                        >
                                            <Plus size={18} color="white" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(item._id)}
                                        disabled={isRemoving}
                                        className={`remove-btn ${isRemoving ? 'disabled' : ''}`}
                                    >
                                        {isRemoving ? (
                                            <Loader size={20} color="white" style={{ animation: 'spin 1s linear infinite' }} />
                                        ) : (
                                            <Trash2 size={22} color="#ef4444" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary Section */}
                <div className="order-summary">
                    <h2 className="summary-title">
                        Order Summary
                    </h2>

                    <div className="summary-details">
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">
                                {currency}{getCartAmount().toLocaleString()}
                            </span>
                        </div>

                        <div className="summary-row highlight">
                            <span className="summary-label">Special Discount</span>
                            <span className="summary-value discount">
                                -{currency}{calculateDiscount().toLocaleString()}
                            </span>
                        </div>

                        <div className="summary-row divider">
                            <span className="summary-label">Shipping</span>
                            <span className={`summary-value ${shippingFee === 0 ? 'free' : ''}`}>
                                {shippingFee === 0 ? 'FREE 🎉' : `${currency}${shippingFee}`}
                            </span>
                        </div>

                        <div className="summary-row total">
                            <span className="summary-label total-label">
                                Total Amount
                            </span>
                            <span className="summary-value total-value">
                                {currency}{(getCartAmount() - calculateDiscount() + shippingFee).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/place-order')}
                        className="checkout-btn"
                    >
                        Proceed to Checkout
                        <ArrowRight size={24} className="arrow-icon" />
                    </button>

                    <p className="summary-footer">
                        ⚡ Secure checkout · Free returns · 24/7 support
                    </p>
                </div>
            </div>

            <style>{`
                .cart-page-container {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
                    min-height: 100vh;
                }

                .cart-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 40px;
                    margin-top: 40px;
                }

                .cart-items-list {
                    display: flex;
                    flex-direction: column;
                    gap: 25px;
                }

                .cart-item {
                    display: flex;
                    align-items: center;
                    gap: 25px;
                    padding: 25px;
                    background-color: white;
                    border-radius: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
                    border: 2px solid transparent;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .cart-item:hover {
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    border-color: #fbbf24;
                    transform: translateY(-5px);
                }

                .cart-item.removing {
                    opacity: 0;
                    transform: translateX(-100%);
                }

                .cart-item-image-wrapper {
                    position: relative;
                    overflow: hidden;
                    border-radius: 15px;
                    flex-shrink: 0;
                }

                .cart-item-image {
                    width: 120px;
                    height: 120px;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }

                .cart-item-image:hover {
                    transform: scale(1.1);
                }

                .cart-item-qty-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 4px 10px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .cart-item-details {
                    flex: 1;
                }

                .product-name {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin-bottom: 8px;
                }

                .product-price-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex-wrap: wrap;
                    margin-bottom: 8px;
                }

                .current-price {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #ea580c;
                    background: linear-gradient(45deg, #ea580c, #f97316);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .original-price {
                    font-size: 1rem;
                    color: #9ca3af;
                    text-decoration: line-through;
                }

                .sale-badge {
                    font-size: 0.875rem;
                    background: linear-gradient(45deg, #ef4444, #dc2626);
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 700;
                    animation: pulse 1.5s infinite;
                }

                .product-meta {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin-bottom: 4px;
                }

                .cart-item-actions {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .quantity-controls {
                    display: flex;
                    align-items: center;
                    background: white;
                    border-radius: 15px;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    border: 2px solid #e5e7eb;
                }

                .qty-btn {
                    padding: 12px 16px;
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qty-btn:hover {
                    background: #d1d5db;
                }

                .qty-btn.increment {
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                }

                .qty-btn.increment:hover {
                    background: #047857;
                }

                .qty-display {
                    padding: 0 20px;
                    font-size: 1.125rem;
                    font-weight: 800;
                    color: #1f2937;
                    min-width: 60px;
                    text-align: center;
                }

                .remove-btn {
                    padding: 12px;
                    background: linear-gradient(135deg, #fecaca 0%, #fca5a5 100%);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
                }

                .remove-btn:not(:disabled):hover {
                    transform: scale(1.1) rotate(5deg);
                }

                .remove-btn.disabled {
                    background: #9ca3af;
                    cursor: not-allowed;
                }

                /* Order Summary Styles */
                .order-summary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px;
                    border-radius: 30px;
                    color: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    position: sticky;
                    top: 40px;
                    animation: float 3s ease-in-out infinite;
                    height: fit-content;
                }

                .summary-title {
                    font-size: 2rem;
                    font-weight: 900;
                    margin-bottom: 30px;
                    text-align: center;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                }

                .summary-details {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .summary-row.highlight {
                    animation: glow 2s infinite alternate;
                }

                .summary-row.divider {
                    padding: 15px 0;
                    border-top: 1px solid rgba(255,255,255,0.2);
                    border-bottom: 1px solid rgba(255,255,255,0.2);
                }

                .summary-row.total {
                    padding-top: 20px;
                    border-top: 2px solid rgba(255,255,255,0.3);
                }

                .summary-label {
                    font-size: 1.125rem;
                    opacity: 0.9;
                }

                .summary-label.total-label {
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: 0.5px;
                }

                .summary-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .summary-value.discount {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #fbbf24;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .summary-value.free {
                    color: #34d399;
                }

                .summary-value.total-value {
                    font-size: 2.5rem;
                    font-weight: 900;
                    background: linear-gradient(45deg, #fff, #fbbf24);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }

                .checkout-btn {
                    width: 100%;
                    margin-top: 40px;
                    background: linear-gradient(45deg, #fbbf24 0%, #f59e0b 100%);
                    color: #1f2937;
                    padding: 20px;
                    border-radius: 20px;
                    border: none;
                    font-size: 1.25rem;
                    font-weight: 800;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(251, 191, 36, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .checkout-btn:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 20px 40px rgba(251, 191, 36, 0.6);
                }
                
                .checkout-btn:active {
                    transform: scale(0.95);
                }

                .arrow-icon {
                    transition: transform 0.3s ease;
                }

                .summary-footer {
                    text-align: center;
                    margin-top: 20px;
                    font-size: 0.875rem;
                    opacity: 0.8;
                    font-style: italic;
                }

                /* Animations */
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                @keyframes slideOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100px); }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes glow {
                    from { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #fbbf24; }
                    to { text-shadow: 0 0 10px #fff, 0 0 20px #ffd700, 0 0 30px #ffd700; }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Responsive Design */
                @media (min-width: 1024px) {
                    .cart-grid {
                        grid-template-columns: 2fr 1fr;
                    }
                }

                @media (max-width: 768px) {
                    .cart-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 20px;
                        text-align: left;
                    }

                    .cart-item-image-wrapper {
                        width: 100%;
                        height: 200px;
                        display: flex;
                        justify-content: center;
                        background: #f9fafb;
                    }

                    .cart-item-image {
                        width: auto;
                        height: 100%;
                        max-width: 100%;
                    }

                    .cart-item-details {
                        width: 100%;
                    }

                    .cart-item-actions {
                        width: 100%;
                        justify-content: space-between;
                        margin-top: 10px;
                    }
                    
                    .order-summary {
                         position: relative;
                         top: 0;
                         margin-top: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Cart;