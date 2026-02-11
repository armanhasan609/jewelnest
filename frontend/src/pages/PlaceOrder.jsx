import React, { useState, useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CreditCard, Wallet, Smartphone, Lock, CheckCircle, Truck, Shield, Package, Star } from 'lucide-react';

const PlaceOrder = () => {
    const {
        getCartAmount, delivery_fee, currency,
        backendUrl, cartItems, products,
        token, setCartItems, getCartCount,
        getProductCurrentPrice,
        userId, user
    } = useContext(ShopContext);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewProductId, setReviewProductId] = useState(null);
    const [reviewProductIds, setReviewProductIds] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        street: '', city: '', state: '',
        phone: '', pincode: ''
    });

    const cartTotal = getCartAmount();
    const cartCount = getCartCount();
    const discount = cartTotal > 5000 ? cartTotal * 0.1 : 0;

    const FREE_SHIPPING_THRESHOLD = 499;
    const isFreeShipping = cartTotal > FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShipping ? 0 : 50;

    const orderTotal = cartTotal - discount + shippingFee;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }

        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.state.trim()) newErrors.state = 'State is required';

        const pincodeRegex = /^[0-9]{6}$/;
        if (!formData.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!pincodeRegex.test(formData.pincode)) {
            newErrors.pincode = 'Please enter a valid 6-digit pincode';
        }

        if (!agreeToTerms) newErrors.terms = 'Please accept terms and conditions';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!token) {
            toast.error("Please login first");
            return;
        }

        const items = [];
        for (const id in cartItems) {
            const p = products.find((x) => x._id === id);
            if (p && cartItems[id] > 0) {
                // --- 🟢 IMAGE FIX START ---
                let safeImage = '';

                // Priority 1: Check 'images' array (Cloudinary standard)
                if (Array.isArray(p.images) && p.images.length > 0) {
                    safeImage = typeof p.images[0] === 'object' ? p.images[0].url : p.images[0];
                }
                // Priority 2: Check 'image' (Legacy or singular)
                else if (p.image) {
                    safeImage = Array.isArray(p.image) ? p.image[0] : p.image;
                }
                // --- 🟢 IMAGE FIX END ---

                items.push({
                    productId: p._id,
                    name: p.name,
                    price: Number(getProductCurrentPrice(p)),
                    quantity: Number(cartItems[id]),
                    image: safeImage || "https://via.placeholder.com/150",
                    images: [safeImage] || ["https://via.placeholder.com/150"],
                    sku: p.sku || 'N/A',
                    category: p.category || 'General',
                    size: p.size || '',
                    color: p.color || '',
                    material: p.material || '',
                    weight: p.weight || ''
                });
            }
        }

        if (items.length === 0) {
            toast.error("No items in cart");
            return;
        }

        // Explicitly cast to Numbers for safety
        const safeSubtotal = Number(getCartAmount()) || 0;
        const safeDiscount = Number(discount) || 0;
        const safeShipping = Number(shippingFee) || 0;
        const safeTotal = Number(orderTotal) || (safeSubtotal - safeDiscount + safeShipping);

        const orderData = {
            userId: userId,
            customerName: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phoneNumber: formData.phone,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            },
            items: items,
            subtotal: safeSubtotal,
            discount: safeDiscount,
            shipping: safeShipping,
            totalAmount: safeTotal,
            paymentMethod: paymentMethod.toUpperCase(),
            paymentStatus: paymentMethod === 'cod' ? 'PENDING' : 'PENDING',
            orderStatus: 'CONFIRMED',
            date: new Date()
        };

        try {
            setLoading(true);

            if (paymentMethod === 'razorpay') {
                await initiateRazorpayPayment(orderData);
            } else {
                // COD flow
                const res = await axios.post(
                    `${backendUrl}/api/orders/place`,
                    orderData,
                    {
                        headers: {
                            token,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (res.data.success) {
                    const orderId = res.data.orderId;
                    setCreatedOrderId(orderId);
                    const orderedIds = items.map((i) => i.productId);
                    setReviewProductIds(orderedIds);
                    setReviewProductId(orderedIds[0] || null);
                    setCartItems({});
                    localStorage.removeItem("cartItems");
                    setOrderPlaced(true);
                    toast.success("Order placed successfully 🎉");
                } else {
                    toast.error(res.data.message || "Order placement failed");
                }
            }
        } catch (err) {
            console.error("Order Error Details:", err.response?.data || err.message);
            console.error("Full Error:", err);

            // Show more detailed error
            const errorMsg = err.response?.data?.message ||
                err.response?.data?.error ||
                err.message ||
                "Failed to place order";
            toast.error(`Order failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const initiateRazorpayPayment = async (orderData) => {
        try {
            const rpRes = await axios.post(
                `${backendUrl}/api/orders/razorpay/create`,
                { amount: orderData.totalAmount },
                { headers: { token } }
            );

            if (!rpRes.data.success) {
                toast.error("Failed to create payment order");
                return;
            }

            const { keyId, order: rpOrder } = rpRes.data;

            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: keyId,
                    amount: rpOrder.amount,
                    currency: rpOrder.currency,
                    name: 'JewelNest',
                    description: 'Order Payment',
                    order_id: rpOrder.id,
                    handler: async (response) => {
                        // Create order only after payment success
                        const placeRes = await axios.post(
                            `${backendUrl}/api/orders/place`,
                            orderData,
                            { headers: { token } }
                        );

                        if (placeRes.data.success) {
                            const orderId = placeRes.data.orderId;
                            setCreatedOrderId(orderId);

                            const orderedIds = orderData.items.map((i) => i.productId);
                            setReviewProductIds(orderedIds);
                            setReviewProductId(orderedIds[0] || null);

                            await verifyRazorpayPayment(
                                orderId,
                                rpOrder.id,
                                response.razorpay_payment_id,
                                response.razorpay_signature
                            );
                        } else {
                            toast.error(placeRes.data.message || "Order placement failed");
                        }
                    },
                    prefill: {
                        name: orderData.customerName,
                        email: orderData.email,
                        contact: orderData.phoneNumber
                    },
                    theme: { color: '#b8860b' }
                };

                const checkout = new window.Razorpay(options);
                checkout.open();
            };
        } catch (error) {
            console.error("Razorpay init error:", error);
            toast.error("Failed to initiate payment");
        }
    };

    const verifyRazorpayPayment = async (orderId, rpOrderId, rpPaymentId, rpSignature) => {
        try {
            const verifyRes = await axios.post(
                `${backendUrl}/api/orders/razorpay/verify`,
                { orderId, razorpay_order_id: rpOrderId, razorpay_payment_id: rpPaymentId, razorpay_signature: rpSignature },
                { headers: { token } }
            );

            if (verifyRes.data.success) {
                setCartItems({});
                localStorage.removeItem("cartItems");
                setOrderPlaced(true);
                toast.success("Payment successful! Order confirmed 🎉");
            } else {
                toast.error("Payment verification failed");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
        }
    };

    const containerStyle = {
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: 'calc(100vh - 80px)'
    };

    const mainLayoutStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        maxWidth: '1200px',
        margin: '0 auto',
        '@media (minWidth: 1024px)': {
            flexDirection: 'row'
        }
    };

    const sectionContainerStyle = {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6'
    };

    const titleStyle = {
        fontSize: '24px',
        fontWeight: '700',
        color: '#1a202c',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const inputContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    };

    const inputRowStyle = {
        display: 'flex',
        gap: '16px',
        '@media (maxWidth: 640px)': {
            flexDirection: 'column'
        }
    };

    const inputStyle = {
        padding: '14px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        transition: 'all 0.3s ease',
        flex: '1',
        backgroundColor: '#f9fafb'
    };

    const inputFocusStyle = {
        borderColor: '#b8860b',
        backgroundColor: 'white',
        boxShadow: '0 0 0 3px rgba(184, 134, 11, 0.1)'
    };

    const errorStyle = {
        color: '#dc2626',
        fontSize: '12px',
        marginTop: '4px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    };

    const paymentMethodStyle = (method) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px',
        borderRadius: '12px',
        border: '2px solid',
        borderColor: paymentMethod === method ? '#b8860b' : '#e5e7eb',
        backgroundColor: paymentMethod === method ? '#fef3c7' : 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        flex: '1',
        minWidth: '200px'
    });

    const paymentMethodHoverStyle = {
        borderColor: '#b8860b',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    };

    const summaryItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: '1px solid #f3f4f6'
    };

    const totalAmountStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px 0',
        borderTop: '2px solid #e5e7eb',
        fontSize: '18px',
        fontWeight: '700',
        color: '#1a202c'
    };

    const submitButtonStyle = {
        width: '100%',
        padding: '18px',
        backgroundColor: '#b8860b',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '24px'
    };

    const submitButtonHoverStyle = {
        backgroundColor: '#a4710a',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(184, 134, 11, 0.3)'
    };

    const checkboxStyle = {
        width: '18px',
        height: '18px',
        borderRadius: '4px',
        border: '2px solid #d1d5db',
        cursor: 'pointer',
        accentColor: '#b8860b'
    };

    const successContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        margin: '40px auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid #f3f4f6'
    };

    const submitReview = async () => {
        if (!reviewRating || !reviewText.trim()) {
            toast.error('Please add rating and review.');
            return;
        }
        if (!userId) {
            toast.error('Please login to submit a review.');
            return;
        }
        try {
            setReviewSubmitting(true);
            const targetProductId = reviewProductId || reviewProductIds[0];
            if (!targetProductId) {
                toast.error('No product to review');
                return;
            }

            // Use form data name or user object name
            const fullName = formData.firstName && formData.lastName
                ? `${formData.firstName} ${formData.lastName}`
                : (user?.name || 'User');

            console.log("Submitting review with userName:", fullName);

            const res = await axios.post(
                `${backendUrl}/api/reviews`,
                {
                    productId: targetProductId,
                    userId,
                    rating: reviewRating,
                    text: reviewText.trim(),
                    userName: fullName
                },
                { headers: { token } }
            );
            if (res.data?.review) {
                toast.success('Review submitted!');
                setReviewText('');
                setReviewRating(0);

                setReviewProductIds((prev) => {
                    const next = prev.filter((id) => id !== targetProductId);
                    setReviewProductId(next[0] || null);
                    if (next.length === 0) {
                        setShowReviewModal(false);
                        window.location.href = '/orders';
                    }
                    return next;
                });
            }
        } catch (e) {
            console.error("Review error:", e.response?.data || e.message);
            toast.error('Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (orderPlaced) {
        return (
            <div style={containerStyle}>
                <div style={successContainerStyle}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        backgroundColor: '#10b98120',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <CheckCircle size={48} color="#10b981" />
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#1a202c',
                        marginBottom: '12px'
                    }}>
                        Order Confirmed!
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        marginBottom: '8px',
                        lineHeight: '1.6'
                    }}>
                        Your order has been successfully placed and saved to our database.
                    </p>
                    <p style={{
                        fontSize: '14px',
                        color: '#9ca3af',
                        marginBottom: '32px'
                    }}>
                        You will receive a confirmation email shortly.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={() => setShowReviewModal(true)}
                            style={{
                                padding: '14px 32px',
                                backgroundColor: '#b8860b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#a4710a';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#b8860b';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Write a Review
                        </button>
                        <button
                            onClick={() => window.location.href = '/orders'}
                            style={{
                                padding: '14px 32px',
                                backgroundColor: '#1a202c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#111827';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#1a202c';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            View My Orders
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '14px 32px',
                                backgroundColor: 'white',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Continue Shopping
                        </button>
                    </div>

                    {/* Review Modal */}
                    {showReviewModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '32px',
                                maxWidth: '500px',
                                width: '90%'
                            }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Share Your Review</h3>

                                {reviewProductIds.length > 1 && (
                                    <select
                                        value={reviewProductId || ''}
                                        onChange={(e) => setReviewProductId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            padding: '10px',
                                            marginBottom: '16px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="" disabled>Select product</option>
                                        {reviewProductIds.map((pid) => {
                                            const p = products.find((x) => x._id === pid);
                                            return (
                                                <option key={pid} value={pid}>
                                                    {p?.name || pid}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}

                                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setReviewRating(n)}
                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <Star size={24} style={{ color: n <= reviewRating ? '#fbbf24' : '#d1d5db', fill: n <= reviewRating ? '#fbbf24' : 'none' }} />
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
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        padding: '12px',
                                        marginBottom: '16px',
                                        fontSize: '14px'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#f3f4f6',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={submitReview}
                                        disabled={reviewSubmitting}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            backgroundColor: '#b8860b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            opacity: reviewSubmitting ? 0.7 : 1
                                        }}
                                    >
                                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (cartCount === 0) {
        return (
            <div style={{
                ...containerStyle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '24px'
                }}>
                    <Package size={48} color="#9ca3af" />
                </div>
                <h1 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '12px'
                }}>
                    Your cart is empty
                </h1>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '32px',
                    textAlign: 'center',
                    maxWidth: '400px'
                }}>
                    Add some items to your cart before proceeding to checkout.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{
                        padding: '14px 32px',
                        backgroundColor: '#b8860b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#a4710a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#b8860b';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={mainLayoutStyle}>
                {/* Left Column: Delivery Information */}
                <div style={{ flex: '2' }}>
                    <div style={sectionContainerStyle}>
                        <h2 style={titleStyle}>
                            <Truck size={24} color="#b8860b" />
                            Delivery Information
                        </h2>

                        <form onSubmit={handlePlaceOrder}>
                            <div style={inputContainerStyle}>
                                {/* Name Row */}
                                <div style={inputRowStyle}>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="firstName"
                                            onChange={handleInputChange}
                                            value={formData.firstName}
                                            placeholder="First name *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.firstName ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.firstName && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.firstName}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="lastName"
                                            onChange={handleInputChange}
                                            value={formData.lastName}
                                            placeholder="Last name *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.lastName ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.lastName && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.lastName}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <input
                                        name="email"
                                        type="email"
                                        onChange={handleInputChange}
                                        value={formData.email}
                                        placeholder="Email address *"
                                        style={inputStyle}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = errors.email ? '#dc2626' : '#d1d5db';
                                            e.target.style.backgroundColor = '#f9fafb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    {errors.email && (
                                        <div style={errorStyle}>
                                            <span>⚠️</span>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Street Address */}
                                <div>
                                    <input
                                        name="street"
                                        onChange={handleInputChange}
                                        value={formData.street}
                                        placeholder="Street address *"
                                        style={inputStyle}
                                        onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = errors.street ? '#dc2626' : '#d1d5db';
                                            e.target.style.backgroundColor = '#f9fafb';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    {errors.street && (
                                        <div style={errorStyle}>
                                            <span>⚠️</span>
                                            {errors.street}
                                        </div>
                                    )}
                                </div>

                                {/* City and State */}
                                <div style={inputRowStyle}>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="city"
                                            onChange={handleInputChange}
                                            value={formData.city}
                                            placeholder="City *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.city ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.city && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.city}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="state"
                                            onChange={handleInputChange}
                                            value={formData.state}
                                            placeholder="State *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.state ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.state && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.state}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pincode and Phone */}
                                <div style={inputRowStyle}>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="pincode"
                                            onChange={handleInputChange}
                                            value={formData.pincode}
                                            placeholder="Pincode *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.pincode ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.pincode && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.pincode}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ flex: '1' }}>
                                        <input
                                            name="phone"
                                            type="tel"
                                            onChange={handleInputChange}
                                            value={formData.phone}
                                            placeholder="Phone number *"
                                            style={inputStyle}
                                            onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = errors.phone ? '#dc2626' : '#d1d5db';
                                                e.target.style.backgroundColor = '#f9fafb';
                                                e.target.style.boxShadow = 'none';
                                            }}
                                        />
                                        {errors.phone && (
                                            <div style={errorStyle}>
                                                <span>⚠️</span>
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order Summary & Payment */}
                <div style={{ flex: '1' }}>
                    {/* Order Summary */}
                    <div style={sectionContainerStyle}>
                        <h2 style={titleStyle}>
                            <Package size={24} color="#b8860b" />
                            Order Summary
                        </h2>

                        <div>
                            <div style={summaryItemStyle}>
                                <span style={{ color: '#6b7280' }}>Subtotal ({cartCount} items)</span>
                                <span style={{ fontWeight: '600' }}>{currency}{cartTotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div style={summaryItemStyle}>
                                    <span style={{ color: '#6b7280' }}>Discount (10% off)</span>
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}

                            <div style={summaryItemStyle}>
                                <span style={{ color: '#6b7280' }}>Shipping</span>
                                <span>
                                    {isFreeShipping ? (
                                        <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
                                    ) : (
                                        <span style={{ fontWeight: '600' }}>{currency}{shippingFee.toFixed(2)}</span>
                                    )}
                                </span>
                            </div>

                            {!isFreeShipping && cartTotal < FREE_SHIPPING_THRESHOLD && (
                                <div style={{
                                    fontSize: '12px',
                                    color: '#f59e0b',
                                    marginTop: '8px',
                                    padding: '8px',
                                    backgroundColor: '#fef3c7',
                                    borderRadius: '6px',
                                    textAlign: 'center'
                                }}>
                                    Add {currency}{(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more for free shipping!
                                </div>
                            )}

                            <div style={totalAmountStyle}>
                                <span>Total Amount</span>
                                <span>{currency}{orderTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div style={{ ...sectionContainerStyle, marginTop: '24px' }}>
                        <h2 style={titleStyle}>
                            <CreditCard size={24} color="#b8860b" />
                            Payment Method
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div
                                style={paymentMethodStyle('cod')}
                                onClick={() => setPaymentMethod('cod')}
                                onMouseEnter={(e) => {
                                    if (paymentMethod !== 'cod') {
                                        Object.assign(e.currentTarget.style, paymentMethodHoverStyle);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (paymentMethod !== 'cod') {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: paymentMethod === 'cod' ? '#b8860b' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {paymentMethod === 'cod' && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: '#b8860b'
                                        }}></div>
                                    )}
                                </div>
                                <Wallet size={20} color="#6b7280" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                                        Cash on Delivery
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        Pay when you receive
                                    </div>
                                </div>
                            </div>

                            <div
                                style={paymentMethodStyle('razorpay')}
                                onClick={() => setPaymentMethod('razorpay')}
                                onMouseEnter={(e) => {
                                    if (paymentMethod !== 'razorpay') {
                                        Object.assign(e.currentTarget.style, paymentMethodHoverStyle);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (paymentMethod !== 'razorpay') {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: paymentMethod === 'razorpay' ? '#b8860b' : '#d1d5db',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {paymentMethod === 'razorpay' && (
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            backgroundColor: '#b8860b'
                                        }}></div>
                                    )}
                                </div>
                                <Smartphone size={20} color="#6b7280" />
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a202c' }}>
                                        Razorpay
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                        UPI, Cards & Wallets
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#374151'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    style={checkboxStyle}
                                />
                                <div>
                                    I agree to the{' '}
                                    <a href="/terms" style={{ color: '#b8860b', textDecoration: 'none' }}>
                                        Terms and Conditions
                                    </a>
                                    {' '}and{' '}
                                    <a href="/privacy" style={{ color: '#b8860b', textDecoration: 'none' }}>
                                        Privacy Policy
                                    </a>
                                </div>
                            </label>
                            {errors.terms && (
                                <div style={errorStyle}>
                                    <span>⚠️</span>
                                    {errors.terms}
                                </div>
                            )}
                        </div>

                        {/* Security Note */}
                        <div style={{
                            marginTop: '20px',
                            padding: '12px',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Shield size={16} color="#0369a1" />
                            <div style={{ fontSize: '12px', color: '#0369a1' }}>
                                Your payment information is secure and encrypted.
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cartCount === 0}
                            style={{
                                ...submitButtonStyle,
                                backgroundColor: loading || cartCount === 0 ? '#9ca3af' : '#b8860b',
                                cursor: loading || cartCount === 0 ? 'not-allowed' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading && cartCount > 0) {
                                    Object.assign(e.currentTarget.style, submitButtonHoverStyle);
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && cartCount > 0) {
                                    e.currentTarget.style.backgroundColor = '#b8860b';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }}></div>
                                    Processing Order...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Place Order • {currency}{orderTotal.toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PlaceOrder;