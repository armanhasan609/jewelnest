import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ShopContext } from '../context/ShopContext';
import { Package, Truck, CheckCircle, X, Clock } from 'lucide-react';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalAnimation, setModalAnimation] = useState('enter');

    const { backendUrl, token, currency, products } = useContext(ShopContext);

    const fetchUserOrders = async () => {
        try {
            setLoading(true);

            if (!token) {
                toast.error("Please login to view orders");
                setLoading(false);
                return;
            }

            console.log("Token sent:", token.substring(0, 20) + "...");

            const response = await axios.post(
                `${backendUrl}/api/orders/userorders`,
                {},
                {
                    headers: {
                        token: token
                    }
                }
            );

            console.log("Orders Response:", response.data);

            if (response.data.success) {
                // Keep orders grouped instead of flattening
                let userOrders = response.data.orders || [];

                // Normalize items to match OrderDetails logic exactly
                userOrders = userOrders.map(order => ({
                    ...order,
                    items: Array.isArray(order.items) ? order.items.map(item => {
                        let images = [];

                        // Helper to extract URL from various formats (string or object)
                        const extractUrl = (img) => {
                            if (!img) return null;
                            if (typeof img === 'string') return img;
                            if (typeof img === 'object' && img.url) return img.url; // Handle Cloudinary object
                            return null;
                        };

                        // Logic updated to handle image objects and arrays correctly
                        if (Array.isArray(item.images) && item.images.length > 0) {
                            images = item.images.map(extractUrl).filter(Boolean);
                        } else if (Array.isArray(item.image) && item.image.length > 0) {
                            images = item.image.map(extractUrl).filter(Boolean);
                        } else {
                            // Handle single values
                            const singleImg = extractUrl(item.image || item.images || item.imageUrl);
                            if (singleImg) images = [singleImg];
                        }

                        // Fallback image if none found
                        if (images.length === 0) {
                            images = ['https://placehold.co/150'];
                        }

                        // RECOVER QUANTITY: Check if quantity exists, if not derive from total and price
                        // This fixes issues where partial data is sent by backend
                        let rawQty = item.quantity;
                        if ((!rawQty || rawQty === 0) && item.total && item.price) {
                            rawQty = item.total / item.price;
                        }

                        // Parse properly
                        let parsedQty = Number(rawQty);
                        if (isNaN(parsedQty) || parsedQty < 1) {
                            parsedQty = 1;
                        }

                        return {
                            ...item,
                            images: images.length > 0 ? images : [],
                            quantity: parsedQty
                        };
                    }) : []
                }));

                setOrders(userOrders); // Already sorted from backend usually, but can reverse if needed

                if (userOrders.length > 0) {
                    // toast.success(`Loaded ${userOrders.length} orders`);
                }
            } else {
                toast.error(response.data.message || "Failed to fetch orders");
                setOrders([]);
            }
        } catch (error) {
            console.error("Order Fetch Error:", error.response?.data || error.message);

            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again");
            } else if (error.response?.status === 404) {
                toast.error("Orders endpoint not configured");
            } else if (error.response?.status === 500) {
                toast.error("Server error. Please try again");
            } else {
                toast.error("Failed to load orders");
            }
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserOrders();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/orders/userorders`,
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                // Since we now store orders directly, we can find it in state or use response
                const order = response.data.orders.find(o => o._id === orderId);
                if (order) {
                    setSelectedOrder(order);
                    setModalAnimation('enter');
                    setShowOtpModal(true);

                    if (order.status === 'Out for delivery' || order.orderStatus === 'Out for delivery') {
                        if (order.otp) {
                            // OTP modal will be shown
                        } else {
                            toast.info('OTP will be sent to your email once the delivery partner is assigned');
                        }
                    } else {
                        toast.info(`Order Status: ${order.status || order.orderStatus}`);
                    }
                }
            }
        } catch (error) {
            console.error("Order Details Error:", error);
            toast.error('Failed to fetch order details');
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            const response = await axios.post(
                `${backendUrl}/api/orders/cancel`,
                { orderId },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Order cancelled successfully');
                fetchUserOrders();
            } else {
                toast.error(response.data.message || 'Cancel failed');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Cancel failed');
        }
    };

    const closeModal = () => {
        setModalAnimation('exit');
        setTimeout(() => {
            setShowOtpModal(false);
        }, 300);
    };

    // Simplified getPrimaryImage using normalized data
    const getPrimaryImage = (item) => {
        if (item && item.images && item.images.length > 0) {
            return item.images[0];
        }
        return '';
    };

    if (!token) {
        return (
            <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '4rem',
                paddingLeft: '1rem',
                paddingRight: '1rem',
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <Package size={64} style={{ color: '#d1d5db', marginBottom: '1rem' }} />
                <h2 style={{
                    fontSize: '1.875rem',
                    fontWeight: '700',
                    color: '#374151',
                    marginBottom: '0.5rem',
                    textAlign: 'center'
                }}>Please Login</h2>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', textAlign: 'center' }}>
                    You need to login to view your orders
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{
                        background: 'linear-gradient(45deg, #000000, #374151)',
                        color: 'white',
                        padding: '0.75rem 2rem',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        transform: 'translateY(0)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                        e.currentTarget.style.background = 'linear-gradient(45deg, #374151, #1f2937)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = 'linear-gradient(45deg, #000000, #374151)';
                    }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div style={{
            borderTop: '1px solid #e5e7eb',
            paddingTop: '4rem',
            paddingLeft: 'calc(5vw - 1rem)',
            paddingRight: 'calc(5vw - 1rem)',
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: '100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, rgba(59, 130, 246, 0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    marginBottom: '1.5rem',
                    animation: 'slideDown 0.6s ease-out'
                }}>
                    <h2 style={{
                        fontSize: '1.875rem',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: '#111827',
                        marginBottom: '0.25rem',
                        background: 'linear-gradient(45deg, #1f2937, #374151)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>My Orders</h2>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        fontWeight: '400',
                        marginTop: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Clock size={16} />
                        Track and manage your orders
                    </p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '4rem',
                            background: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: '1rem',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    animation: 'spin 1s linear infinite',
                                    borderRadius: '50%',
                                    height: '3rem',
                                    width: '3rem',
                                    border: '3px solid #f3f4f6',
                                    borderTop: '3px solid #3b82f6',
                                    boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                                }} />
                                <p style={{
                                    color: '#4b5563',
                                    fontWeight: '500',
                                    animation: 'pulse 2s infinite'
                                }}>Loading your orders...</p>
                            </div>
                        </div>
                    ) : orders.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '4rem',
                            border: '2px dashed #d1d5db',
                            borderRadius: '1rem',
                            background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                        }}>
                            <Package size={48} style={{
                                margin: '0 auto 1rem',
                                color: '#d1d5db',
                                animation: 'bounce 2s infinite'
                            }} />
                            <p style={{
                                color: '#4b5563',
                                fontSize: '1.125rem',
                                fontWeight: '600',
                                marginBottom: '1rem'
                            }}>No orders yet</p>
                            <p style={{
                                color: '#6b7280',
                                fontSize: '0.875rem',
                                marginBottom: '1.5rem'
                            }}>Start shopping to place your first order</p>
                            <button
                                onClick={() => window.location.href = '/collection'}
                                style={{
                                    background: 'linear-gradient(45deg, #000000, #374151)',
                                    color: 'white',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    transform: 'translateY(0)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                    e.currentTarget.style.background = 'linear-gradient(45deg, #374151, #1f2937)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                    e.currentTarget.style.background = 'linear-gradient(45deg, #000000, #374151)';
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {/* Grouped Order Display */}
                            {orders.map((order, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'white',
                                        padding: '1.5rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '1rem',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                        animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                                        opacity: 0,
                                        transform: 'translateY(20px)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-5px)';
                                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {/* Order Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            borderBottom: '1px solid #f3f4f6',
                                            paddingBottom: '1rem',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827' }}>
                                                    Order ID: <span style={{ fontFamily: 'monospace', color: '#6b7280' }}>{order._id}</span>
                                                </h3>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                    Placed on: <span style={{ fontWeight: '500', color: '#374151' }}>{new Date(order.date).toLocaleDateString()}</span>
                                                </p>
                                            </div>

                                            {/* Status Badge */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {order.status === 'Delivered' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <CheckCircle size={18} style={{ color: '#10b981' }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Delivered</span>
                                                    </div>
                                                ) : order.status === 'Shipped' || order.status === 'Out for delivery' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <Truck size={18} style={{ color: '#3b82f6' }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#3b82f6', textTransform: 'uppercase' }}>{order.status}</span>
                                                    </div>
                                                ) : order.status === 'Cancelled' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <X size={18} style={{ color: '#ef4444' }} />
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#ef4444', textTransform: 'uppercase' }}>Cancelled</span>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: '#f97316', animation: 'pulse 1.5s infinite' }}></div>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#f97316', textTransform: 'uppercase' }}>{order.status}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {order.items.map((item, i) => {
                                                // Quantity is already normalized in fetchUserOrders
                                                const itemQty = item.quantity;
                                                const itemPrice = Number(item.price) || 0;
                                                const itemTotal = itemQty * itemPrice;

                                                return (
                                                    <div key={i} style={{
                                                        display: 'flex',
                                                        gap: '1rem',
                                                        alignItems: 'center',
                                                        background: '#f9fafb',
                                                        padding: '0.875rem',
                                                        borderRadius: '0.75rem',
                                                        border: '1px solid #f3f4f6'
                                                    }}>
                                                        <img
                                                            src={item.variantImage || getPrimaryImage(item)}
                                                            alt={item.name || 'Product'}
                                                            style={{
                                                                width: '5rem',
                                                                height: '5rem',
                                                                objectFit: 'cover',
                                                                borderRadius: '0.5rem',
                                                                border: '1px solid #e5e7eb',
                                                                flexShrink: 0
                                                            }}
                                                            onError={(e) => { e.currentTarget.src = "https://placehold.co/64"; }}
                                                        />
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            {/* Product Name */}
                                                            <p style={{
                                                                fontWeight: '700',
                                                                color: '#1f2937',
                                                                fontSize: '1rem',
                                                                marginBottom: '4px',
                                                                lineHeight: '1.3',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {item.name || (products.find(p => p._id === (item.productId?._id || item.productId))?.name) || 'Unnamed Product'}
                                                            </p>

                                                            {/* Variant Info (Color & Size) */}
                                                            {(item.selectedColor || item.selectedSize || item.color || item.size) && (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    gap: '6px',
                                                                    flexWrap: 'wrap',
                                                                    marginBottom: '4px'
                                                                }}>
                                                                    {(item.selectedColor || item.color) && (
                                                                        <span style={{
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: '600',
                                                                            color: '#7c3aed',
                                                                            background: '#ede9fe',
                                                                            padding: '2px 8px',
                                                                            borderRadius: '10px'
                                                                        }}>
                                                                            🎨 {item.selectedColor || item.color}
                                                                        </span>
                                                                    )}
                                                                    {(item.selectedSize || item.size) && (
                                                                        <span style={{
                                                                            fontSize: '0.7rem',
                                                                            fontWeight: '600',
                                                                            color: '#0369a1',
                                                                            background: '#e0f2fe',
                                                                            padding: '2px 8px',
                                                                            borderRadius: '10px'
                                                                        }}>
                                                                            📐 {item.selectedSize || item.size}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Qty × Price */}
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '0.75rem',
                                                                fontSize: '0.8rem',
                                                                color: '#6b7280'
                                                            }}>
                                                                <span>Qty: <strong style={{ color: '#374151' }}>{itemQty}</strong></span>
                                                                <span>×</span>
                                                                <span>{currency}{itemPrice.toLocaleString()}</span>
                                                            </div>
                                                        </div>

                                                        {/* Item Total */}
                                                        <div style={{
                                                            fontWeight: '800',
                                                            color: '#111827',
                                                            fontSize: '1rem',
                                                            whiteSpace: 'nowrap',
                                                            flexShrink: 0
                                                        }}>
                                                            {currency}{itemTotal.toLocaleString()}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Actions */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            borderTop: '1px solid #f3f4f6',
                                            paddingTop: '1rem',
                                            marginTop: '0.5rem',
                                            flexWrap: 'wrap-reverse',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                                                <button
                                                    onClick={() => fetchOrderDetails(order._id)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        fontSize: '0.875rem',
                                                        fontWeight: '600',
                                                        color: '#ffffff',
                                                        backgroundColor: '#1f2937',
                                                        border: 'none',
                                                        borderRadius: '0.375rem',
                                                        cursor: 'pointer',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.target.style.background = '#374151'}
                                                    onMouseLeave={(e) => e.target.style.background = '#1f2937'}
                                                >
                                                    Track Order
                                                </button>

                                                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                    <button
                                                        onClick={() => cancelOrder(order._id)}
                                                        style={{
                                                            padding: '0.5rem 1rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            color: '#ef4444',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid #ef4444',
                                                            borderRadius: '0.375rem',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s'
                                                        }}
                                                        onMouseEnter={(e) => { e.target.style.background = '#ef4444'; e.target.style.color = 'white'; }}
                                                        onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ef4444'; }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                    Payment: <span style={{ fontWeight: '600', color: order.paymentMethod === 'COD' ? '#d97706' : '#059669' }}>{order.paymentMethod}</span>
                                                </p>
                                                <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#111827' }}>
                                                    Total: {currency}{Number(order.totalAmount || 0).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100,
                    padding: '1rem',
                    animation: modalAnimation === 'enter' ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-out'
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        maxWidth: '28rem',
                        width: '100%',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: modalAnimation === 'enter' ? 'modalSlideIn 0.4s ease-out' : 'modalSlideOut 0.4s ease-out',
                        transform: modalAnimation === 'enter' ? 'scale(1)' : 'scale(0.95)',
                        opacity: modalAnimation === 'enter' ? 1 : 0
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <Truck size={24} />
                                Delivery OTP
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    padding: '0.25rem',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    borderRadius: '0.5rem',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f3f4f6';
                                    e.currentTarget.style.transform = 'rotate(90deg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.transform = 'rotate(0deg)';
                                }}
                            >
                                <X size={24} color="#6b7280" />
                            </button>
                        </div>

                        <p style={{
                            color: '#6b7280',
                            textAlign: 'center',
                            marginBottom: '1.5rem',
                            lineHeight: '1.6'
                        }}>
                            Share this OTP with the delivery partner for verification
                        </p>

                        <div style={{
                            background: 'linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)',
                            padding: '2rem',
                            borderRadius: '1rem',
                            marginBottom: '1.5rem',
                            textAlign: 'center',
                            border: '2px solid #93c5fd',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute',
                                top: '0.5rem',
                                right: '0.5rem',
                                fontSize: '0.75rem',
                                color: '#3b82f6',
                                fontWeight: '600',
                                background: 'rgba(255, 255, 255, 0.8)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem'
                            }}>
                                VALID FOR DELIVERY
                            </div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: '#3b82f6',
                                marginBottom: '0.5rem',
                                fontWeight: '600'
                            }}>Your One-Time Password</p>
                            <p style={{
                                fontSize: '3.5rem',
                                fontWeight: '800',
                                color: '#1d4ed8',
                                letterSpacing: '0.5rem',
                                textShadow: '0 4px 8px rgba(59, 130, 246, 0.2)',
                                animation: 'glow 1.5s infinite alternate'
                            }}>
                                {selectedOrder.otp}
                            </p>
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginTop: '0.5rem',
                                fontStyle: 'italic'
                            }}>
                                Please don't share this with anyone except the delivery agent
                            </p>
                        </div>

                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(selectedOrder.otp);
                                toast.success('OTP copied to clipboard');
                            }}
                            style={{
                                width: '100%',
                                background: 'linear-gradient(45deg, #3b82f6, #2563eb)',
                                color: 'white',
                                padding: '0.875rem',
                                borderRadius: '0.75rem',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                marginBottom: '0.75rem',
                                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                                transform: 'translateY(0)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                e.currentTarget.style.background = 'linear-gradient(45deg, #2563eb, #1d4ed8)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
                                e.currentTarget.style.background = 'linear-gradient(45deg, #3b82f6, #2563eb)';
                            }}
                        >
                            📋 Copy OTP to Clipboard
                        </button>

                        <button
                            onClick={closeModal}
                            style={{
                                width: '100%',
                                border: '2px solid #d1d5db',
                                background: 'transparent',
                                color: '#6b7280',
                                padding: '0.875rem',
                                borderRadius: '0.75rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                                e.currentTarget.style.borderColor = '#9ca3af';
                                e.currentTarget.style.color = '#374151';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = '#d1d5db';
                                e.currentTarget.style.color = '#6b7280';
                            }}
                        >
                            Close Window
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                @keyframes modalSlideOut {
                    from {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                }
                
                @keyframes glow {
                    from {
                        text-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3);
                    }
                    to {
                        text-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.5);
                    }
                }
                
                @media (min-width: 768px) {
                    div[style*="display: flex; flex-direction: column; gap: 1.5rem"] {
                        flex-direction: row;
                    }
                    div[style*="display: flex; flex-direction: column; alignItems: flex-end;"] {
                        width: 12rem;
                    }
                }
                
                @media (min-width: 1024px) {
                    div[style*="padding-left: calc(5vw - 1rem);"] {
                        padding-left: calc(7vw - 1rem);
                        padding-right: calc(7vw - 1rem);
                    }
                }
            `}</style>
        </div>
    );
};

export default Orders;