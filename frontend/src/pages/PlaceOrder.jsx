import React, { useState, useContext, useEffect } from 'react';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CreditCard, Wallet, Smartphone, Lock, CheckCircle, Truck, Package, Star, Tag, X, Shield } from 'lucide-react';

const PlaceOrder = () => {
    // Scroll to top on component mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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

    // Coupon related state
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        street: '', nearbyLocation: '', city: '', state: '',
        phone: '', pincode: ''
    });

    const cartTotal = getCartAmount();
    const cartCount = getCartCount();
    const discount = cartTotal > 5000 ? cartTotal * 0.1 : 0;

    const FREE_SHIPPING_THRESHOLD = 499;
    const isFreeShipping = cartTotal > FREE_SHIPPING_THRESHOLD;
    const shippingFee = isFreeShipping ? 0 : 50;

    const orderTotal = Math.max(0, cartTotal - discount - couponDiscount + shippingFee);

    const handleApplyCoupon = async () => {
        setCouponError('');
        setCouponSuccess('');
        if (!couponCode.trim()) {
            setCouponError('Please enter a coupon code');
            return;
        }

        try {
            const res = await axios.post(
                `${backendUrl}/api/coupons/validate`,
                { code: couponCode, orderAmount: cartTotal },
                { headers: { token } }
            );

            if (res.data.success) {
                setCouponDiscount(res.data.discountAmount);
                setAppliedCoupon({ code: couponCode, discount: res.data.discountAmount });
                setCouponSuccess(`Coupon applied! You saved ${currency}${res.data.discountAmount}`);
                setCouponError('');
            }
        } catch (err) {
            console.error(err);
            setCouponDiscount(0);
            setAppliedCoupon(null);
            setCouponSuccess('');
            setCouponError(err.response?.data?.message || 'Invalid coupon code');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setCouponDiscount(0);
        setAppliedCoupon(null);
        setCouponSuccess('');
        setCouponError('');
    };

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

        if (couponError && couponCode && !appliedCoupon) {
            toast.error("Please fix coupon error or remove it");
            return;
        }

        if (!token) {
            toast.error("Please login first");
            return;
        }

        const items = [];
        for (const key in cartItems) {
            const entry = cartItems[key];

            if (typeof entry === 'object' && entry.quantity > 0) {
                // Variant item
                const p = products.find((x) => x._id === entry.productId);
                if (p) {
                    let safeImage = entry.variantImage || '';
                    if (!safeImage) {
                        if (Array.isArray(p.images) && p.images.length > 0) {
                            safeImage = typeof p.images[0] === 'object' ? p.images[0].url : p.images[0];
                        } else if (p.image) {
                            safeImage = Array.isArray(p.image) ? p.image[0] : p.image;
                        }
                    }

                    const basePrice = Number(getProductCurrentPrice(p));
                    const priceAdj = Number(entry.priceAdjustment) || 0;

                    items.push({
                        productId: p._id,
                        name: p.name,
                        price: basePrice + priceAdj,
                        quantity: Number(entry.quantity),
                        image: safeImage || "https://placehold.co/150",
                        images: [safeImage] || ["https://placehold.co/150"],
                        sku: entry.variantSku || p.sku || 'N/A',
                        category: p.category || 'General',
                        size: entry.selectedSize || '',
                        color: entry.selectedColor || '',
                        material: p.material || '',
                        weight: p.weight || '',
                        selectedColor: entry.selectedColor,
                        selectedSize: entry.selectedSize,
                        variantSku: entry.variantSku,
                        variantImage: safeImage
                    });
                }
            } else if (typeof entry === 'number' && entry > 0) {
                // Non-variant item (legacy)
                const p = products.find((x) => x._id === key);
                if (p) {
                    let safeImage = '';
                    if (Array.isArray(p.images) && p.images.length > 0) {
                        safeImage = typeof p.images[0] === 'object' ? p.images[0].url : p.images[0];
                    } else if (p.image) {
                        safeImage = Array.isArray(p.image) ? p.image[0] : p.image;
                    }

                    items.push({
                        productId: p._id,
                        name: p.name,
                        price: Number(getProductCurrentPrice(p)),
                        quantity: Number(entry),
                        image: safeImage || "https://placehold.co/150",
                        images: [safeImage] || ["https://placehold.co/150"],
                        sku: p.sku || 'N/A',
                        category: p.category || 'General',
                        size: p.size || '',
                        color: p.color || '',
                        material: p.material || '',
                        weight: p.weight || ''
                    });
                }
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
                nearbyLocation: formData.nearbyLocation,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode
            },
            items: items,
            subtotal: safeSubtotal,
            discount: safeDiscount + (Number(couponDiscount) || 0),
            shipping: safeShipping,
            totalAmount: safeTotal,
            couponCode: appliedCoupon ? appliedCoupon.code : null, // Assuming backend saves this
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
                    window.scrollTo(0, 0);



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
                window.scrollTo(0, 0);
            } else {
                toast.error("Payment verification failed");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed");
        }
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
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#ecfdf5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={40} color="#10b981" />
                        </div>
                    </div>

                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '12px' }}>
                        Order Confirmed!
                    </h2>

                    <p style={{ color: '#4b5563', marginBottom: '8px' }}>
                        Your order has been successfully placed.
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '32px' }}>
                        You will receive a confirmation email shortly.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button
                            onClick={() => setShowReviewModal(true)}
                            style={{
                                padding: '14px',
                                backgroundColor: '#b8860b',
                                color: 'white',
                                borderRadius: '8px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            Write a Review
                        </button>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => window.location.href = '/orders'}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: '#1f2937',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                View Orders
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    backgroundColor: 'white',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>

                    {/* Review Modal */}
                    {showReviewModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                backgroundColor: 'white',
                                padding: '32px',
                                borderRadius: '16px',
                                width: '100%',
                                maxWidth: '450px'
                            }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>Share Your Review</h3>

                                {reviewProductIds.length > 1 && (
                                    <select
                                        value={reviewProductId || ''}
                                        onChange={(e) => setReviewProductId(e.target.value)}
                                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
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

                                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setReviewRating(n)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                        >
                                            <Star size={28} style={{ color: n <= reviewRating ? '#fbbf24' : '#d1d5db', fill: n <= reviewRating ? '#fbbf24' : 'none' }} />
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
                                        padding: '12px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        marginBottom: '20px',
                                        fontSize: '14px',
                                        resize: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => setShowReviewModal(false)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Skip
                                    </button>
                                    <button
                                        onClick={submitReview}
                                        disabled={reviewSubmitting}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            backgroundColor: '#b8860b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
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
            <div className="place-order-container empty-state">
                <div className="empty-cart-icon">
                    <Package size={48} color="#9ca3af" />
                </div>
                <h1 className="empty-cart-title">
                    Your cart is empty
                </h1>
                <p className="empty-cart-message">
                    Add some items to your cart before proceeding to checkout.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="continue-shopping-btn"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="place-order-container">
            <div className="order-layout">
                {/* Left Column: Delivery Information */}
                <div className="left-column">
                    <div className="section-container">
                        <h2 className="section-title">
                            <Truck size={24} color="#b8860b" />
                            Delivery Information
                        </h2>

                        <form onSubmit={handlePlaceOrder}>
                            <div className="input-group">
                                {/* Name Row */}
                                <div className="input-row">
                                    <div className="input-wrapper">
                                        <input
                                            name="firstName"
                                            onChange={handleInputChange}
                                            value={formData.firstName}
                                            placeholder="First name *"
                                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                                        />
                                        {errors.firstName && (
                                            <div className="error-text">
                                                <span>⚠️</span>
                                                {errors.firstName}
                                            </div>
                                        )}
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            name="lastName"
                                            onChange={handleInputChange}
                                            value={formData.lastName}
                                            placeholder="Last name *"
                                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                                        />
                                        {errors.lastName && (
                                            <div className="error-text">
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
                                        className={`form-input ${errors.email ? 'error' : ''}`}
                                    />
                                    {errors.email && (
                                        <div className="error-text">
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
                                        className={`form-input ${errors.street ? 'error' : ''}`}
                                    />
                                    {errors.street && (
                                        <div className="error-text">
                                            <span>⚠️</span>
                                            {errors.street}
                                        </div>
                                    )}
                                </div>

                                {/* Nearby Location */}
                                <div>
                                    <input
                                        name="nearbyLocation"
                                        onChange={handleInputChange}
                                        value={formData.nearbyLocation}
                                        placeholder="Nearby location / landmark (optional)"
                                        className="form-input"
                                    />
                                </div>

                                {/* City and State */}
                                <div className="input-row">
                                    <div className="input-wrapper">
                                        <input
                                            name="city"
                                            onChange={handleInputChange}
                                            value={formData.city}
                                            placeholder="City *"
                                            className={`form-input ${errors.city ? 'error' : ''}`}
                                        />
                                        {errors.city && (
                                            <div className="error-text">
                                                <span>⚠️</span>
                                                {errors.city}
                                            </div>
                                        )}
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            name="state"
                                            onChange={handleInputChange}
                                            value={formData.state}
                                            placeholder="State *"
                                            className={`form-input ${errors.state ? 'error' : ''}`}
                                        />
                                        {errors.state && (
                                            <div className="error-text">
                                                <span>⚠️</span>
                                                {errors.state}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pincode and Phone */}
                                <div className="input-row">
                                    <div className="input-wrapper">
                                        <input
                                            name="pincode"
                                            onChange={handleInputChange}
                                            value={formData.pincode}
                                            placeholder="Pincode *"
                                            className={`form-input ${errors.pincode ? 'error' : ''}`}
                                        />
                                        {errors.pincode && (
                                            <div className="error-text">
                                                <span>⚠️</span>
                                                {errors.pincode}
                                            </div>
                                        )}
                                    </div>
                                    <div className="input-wrapper">
                                        <input
                                            name="phone"
                                            type="tel"
                                            onChange={handleInputChange}
                                            value={formData.phone}
                                            placeholder="Phone number *"
                                            className={`form-input ${errors.phone ? 'error' : ''}`}
                                        />
                                        {errors.phone && (
                                            <div className="error-text">
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
                <div className="right-column">
                    {/* Order Summary */}
                    <div className="section-container">
                        <h2 className="section-title">
                            <Package size={24} color="#b8860b" />
                            Order Summary
                        </h2>

                        <div>
                            {/* Coupon Section */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ position: 'relative', flex: 1 }}>
                                        <Tag size={16} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                                        <input
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter coupon code"
                                            disabled={!!appliedCoupon}
                                            style={{
                                                width: '100%',
                                                padding: '10px 10px 10px 36px',
                                                boxSizing: 'border-box',
                                                border: `1px solid ${couponError ? '#ef4444' : '#e5e7eb'}`,
                                                borderRadius: '6px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                    {appliedCoupon ? (
                                        <button
                                            onClick={handleRemoveCoupon}
                                            style={{
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '0 16px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleApplyCoupon}
                                            style={{
                                                backgroundColor: '#1f2937',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                padding: '0 16px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Apply
                                        </button>
                                    )}
                                </div>
                                {couponError && (
                                    <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                                        {couponError}
                                    </div>
                                )}
                                {couponSuccess && (
                                    <div style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>
                                        {couponSuccess}
                                    </div>
                                )}
                            </div>

                            <div className="summary-item">
                                <span className="summary-label">Subtotal ({cartCount} items)</span>
                                <span className="summary-value">{currency}{cartTotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="summary-item">
                                    <span className="summary-label">Discount (10% off)</span>
                                    <span className="summary-value discount">-{currency}{discount.toFixed(2)}</span>
                                </div>
                            )}

                            {couponDiscount > 0 && (
                                <div className="summary-item">
                                    <span className="summary-label" style={{ color: '#16a34a' }}>Coupon Applied ({couponCode})</span>
                                    <span className="summary-value discount" style={{ color: '#16a34a' }}>-{currency}{Number(couponDiscount).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="summary-item">
                                <span className="summary-label">Shipping</span>
                                <span>
                                    {isFreeShipping ? (
                                        <span className="free-shipping">FREE</span>
                                    ) : (
                                        <span className="summary-value">{currency}{shippingFee.toFixed(2)}</span>
                                    )}
                                </span>
                            </div>

                            {!isFreeShipping && cartTotal < FREE_SHIPPING_THRESHOLD && (
                                <div className="free-shipping-nudge">
                                    Add {currency}{(FREE_SHIPPING_THRESHOLD - cartTotal).toFixed(2)} more for free shipping!
                                </div>
                            )}

                            <div className="total-row">
                                <span>Total Amount</span>
                                <span>{currency}{orderTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="section-container payment-section">
                        <h2 className="section-title">
                            <CreditCard size={24} color="#b8860b" />
                            Payment Method
                        </h2>

                        <div className="payment-methods">
                            <div
                                className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('cod')}
                            >
                                <div className="radio-circle">
                                    {paymentMethod === 'cod' && (
                                        <div className="radio-dot"></div>
                                    )}
                                </div>
                                <Wallet size={20} color="#6b7280" />
                                <div>
                                    <div className="method-title">
                                        Cash on Delivery
                                    </div>
                                    <div className="method-subtitle">
                                        Pay when you receive
                                    </div>
                                </div>
                            </div>

                            <div
                                className={`payment-method-card ${paymentMethod === 'razorpay' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('razorpay')}
                            >
                                <div className="radio-circle">
                                    {paymentMethod === 'razorpay' && (
                                        <div className="radio-dot"></div>
                                    )}
                                </div>
                                <Smartphone size={20} color="#6b7280" />
                                <div>
                                    <div className="method-title">
                                        Razorpay
                                    </div>
                                    <div className="method-subtitle">
                                        UPI, Cards & Wallets
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms & Conditions */}
                        <div className="terms-section">
                            <label className="terms-label">
                                <input
                                    type="checkbox"
                                    checked={agreeToTerms}
                                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                                    className="terms-checkbox"
                                />
                                <div>
                                    I agree to the{' '}
                                    <a href="/terms" className="terms-link">
                                        Terms and Conditions
                                    </a>
                                    {' '}and{' '}
                                    <a href="/privacy" className="terms-link">
                                        Privacy Policy
                                    </a>
                                </div>
                            </label>
                            {errors.terms && (
                                <div className="error-text">
                                    <span>⚠️</span>
                                    {errors.terms}
                                </div>
                            )}
                        </div>

                        {/* Security Note */}
                        <div className="security-note">
                            <Shield size={16} color="#0369a1" />
                            <div className="security-text">
                                Your payment information is secure and encrypted.
                            </div>
                        </div>

                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cartCount === 0}
                            className={`place-order-btn ${loading || cartCount === 0 ? 'disabled' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <div className="spinner"></div>
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

            {/* CSS Styles */}
            <style>{`
                .place-order-container {
                    padding: 24px;
                    background-color: #f9fafb;
                    min-height: calc(100vh - 80px);
                }

                .place-order-container.empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .order-layout {
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .left-column {
                    flex: 2;
                }

                .right-column {
                    flex: 1;
                }

                .section-container {
                    background-color: white;
                    border-radius: 16px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid #f3f4f6;
                }

                .section-title {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 2px solid #f3f4f6;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .input-row {
                    display: flex;
                    gap: 16px;
                }

                .input-wrapper {
                    flex: 1;
                }

                .form-input {
                    width: 100%;
                    padding: 14px 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.3s ease;
                    background-color: #f9fafb;
                    box-sizing: border-box;
                }

                .form-input:focus {
                    border-color: #b8860b;
                    background-color: white;
                    box-shadow: 0 0 0 3px rgba(184, 134, 11, 0.1);
                }

                .form-input.error {
                    border-color: #dc2626;
                }

                .error-text {
                    color: #dc2626;
                    font-size: 12px;
                    margin-top: 4px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 0;
                    border-bottom: 1px solid #f3f4f6;
                }

                .summary-label {
                    color: #6b7280;
                }

                .summary-value {
                    font-weight: 600;
                }

                .summary-value.discount {
                    color: #10b981;
                }

                .free-shipping {
                    color: #10b981;
                    font-weight: 600;
                }

                .free-shipping-nudge {
                   font-size: 12px;
                   color: #f59e0b;
                   margin-top: 8px;
                   padding: 8px;
                   background-color: #fef3c7;
                   border-radius: 6px;
                   text-align: center;
                }

                .total-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 20px 0;
                    border-top: 2px solid #e5e7eb;
                    font-size: 18px;
                    font-weight: 700;
                    color: #1a202c;
                }

                .payment-section {
                    margin-top: 24px;
                }

                .payment-methods {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .payment-method-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    border-radius: 12px;
                    border: 2px solid #e5e7eb;
                    background-color: white;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    flex: 1;
                    min-width: 200px;
                }

                .payment-method-card:hover {
                    border-color: #b8860b;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .payment-method-card.active {
                    border-color: #b8860b;
                    background-color: #fef3c7;
                }

                .radio-circle {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid;
                    border-color: #d1d5db;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .payment-method-card.active .radio-circle {
                    border-color: #b8860b;
                }

                .radio-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background-color: #b8860b;
                }

                .method-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #1a202c;
                }

                .method-subtitle {
                    font-size: 12px;
                    color: #9ca3af;
                }
                
                .terms-section {
                    margin-top: 24px; 
                    padding-top: 24px; 
                    border-top: 1px solid #f3f4f6; 
                }
                
                .terms-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #374151;
                }
                
                .terms-checkbox {
                     width: 18px;
                     height: 18px;
                     border-radius: 4px;
                     border: 2px solid #d1d5db;
                     cursor: pointer;
                     accent-color: #b8860b;
                }
                
                .terms-link {
                    color: #b8860b;
                    text-decoration: none;
                }
                
                .security-note {
                    margin-top: 20px;
                    padding: 12px;
                    background-color: #f0f9ff;
                    border-radius: 8px;
                    border: 1px solid #bae6fd;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .security-text {
                    font-size: 12px;
                    color: #0369a1;
                }

                .place-order-btn {
                    width: 100%;
                    padding: 18px;
                    background-color: #b8860b;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-top: 24px;
                }
                
                .place-order-btn:not(.disabled):hover {
                    background-color: #a4710a;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(184, 134, 11, 0.3);
                }
                
                .place-order-btn.disabled {
                    background-color: #9ca3af;
                    cursor: not-allowed;
                }
                
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                /* Success and Empty States */
                .success-card {
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
                     padding: 60px 20px;
                     text-align: center;
                     background-color: white;
                     border-radius: 20px;
                     max-width: 600px;
                     margin: 40px auto;
                     box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
                     border: 1px solid #f3f4f6;
                }
                
                .success-icon-wrapper {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    background-color: rgba(16, 185, 129, 0.13);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                
                .success-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 12px;
                }
                
                .success-message {
                     font-size: 16px;
                     color: #6b7280;
                     margin-bottom: 8px;
                     line-height: 1.6;
                }
                
                .success-submessage {
                     font-size: 14px;
                     color: #9ca3af;
                     margin-bottom: 32px;
                }
                
                .success-actions {
                    display: flex;
                    gap: 16px;
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                .action-btn {
                     padding: 14px 32px;
                     border-radius: 8px;
                     font-size: 15px;
                     font-weight: 600;
                     cursor: pointer;
                     transition: all 0.3s ease;
                     display: flex;
                     align-items: center;
                     gap: 8px;
                     border: none;
                }
                
                .action-btn:hover {
                    transform: translateY(-2px);
                }
                
                .action-btn.primary {
                    background-color: #b8860b;
                    color: white;
                }
                
                .action-btn.primary:hover {
                     background-color: #a4710a;
                }
                
                .action-btn.secondary {
                    background-color: #1a202c;
                    color: white;
                }
                
                .action-btn.secondary:hover {
                    background-color: #111827;
                }
                
                .action-btn.outline {
                    background-color: white;
                    color: #374151;
                    border: 1px solid #d1d5db;
                }
                
                .action-btn.outline:hover {
                    background-color: #f9fafb;
                }
                
                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0,0,0,0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background-color: white;
                    border-radius: 16px;
                    padding: 32px;
                    max-width: 500px;
                    width: 90%;
                }
                
                .modal-title {
                    font-size: 20px;
                    font-weight: 700;
                    margin-bottom: 16px;
                }
                
                .modal-select, .modal-textarea {
                     width: 100%;
                     border-radius: 8px;
                     border: 1px solid #e5e7eb;
                     padding: 10px;
                     margin-bottom: 16px;
                     font-size: 14px;
                }
                
                .modal-textarea {
                    padding: 12px;
                }
                
                .rating-stars {
                    display: flex;
                    gap: 6px;
                    margin-bottom: 16px;
                }
                
                .star-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .modal-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 600;
                }
                
                .modal-btn.secondary {
                    background-color: #f3f4f6;
                }
                
                .modal-btn.primary {
                    background-color: #b8860b;
                    color: white;
                }
                
                .modal-btn.primary.disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                
                /* Empty Cart */
                .empty-cart-icon {
                     width: 120px;
                     height: 120px;
                     border-radius: 50%;
                     background-color: #f3f4f6;
                     display: flex;
                     align-items: center;
                     justify-content: center;
                     margin-bottom: 24px;
                }
                
                .empty-cart-title {
                     font-size: 24px;
                     font-weight: 600;
                     color: #4b5563;
                     margin-bottom: 12px;
                }
                
                .empty-cart-message {
                     font-size: 14px;
                     color: #6b7280;
                     margin-bottom: 32px;
                     text-align: center;
                     max-width: 400px;
                }
                
                .continue-shopping-btn {
                     padding: 14px 32px;
                     background-color: #b8860b;
                     color: white;
                     border: none;
                     border-radius: 8px;
                     font-size: 15px;
                     font-weight: 600;
                     cursor: pointer;
                     transition: all 0.3s ease;
                }
                
                .continue-shopping-btn:hover {
                    background-color: #a4710a;
                    transform: translateY(-2px);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                /* Responsive */
                @media (min-width: 1024px) {
                    .order-layout {
                        flex-direction: row;
                    }
                }

                @media (max-width: 640px) {
                    .input-row {
                        flex-direction: column;
                    }
                    
                    .payment-methods {
                        flex-direction: column; 
                    }
                    
                    .success-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    
                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                    
                    .section-container {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PlaceOrder;