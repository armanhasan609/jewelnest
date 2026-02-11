import React, { useMemo, useState } from 'react';
import axios from 'axios';

const DeliveryLogin = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [verified, setVerified] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const orderId = useMemo(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('orderId') || '';
    }, []);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!orderId) {
            setMessage('Order ID missing in QR link.');
            return;
        }
        if (!otp.trim()) {
            setMessage('Please enter OTP.');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${BACKEND_URL}/api/orders/verify-otp`, {
                orderId,
                otp: otp.trim()
            });

            if (res.data?.success) {
                setMessage('OTP verified successfully!');
                setVerified(true);
                setOrderDetails(res.data.order || null);
            } else {
                setMessage(res.data?.message || 'Invalid OTP.');
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkDelivered = async () => {
        if (!window.confirm('Mark this order as delivered?')) return;

        // Use OTP for authorization instead of admin token
        // Requires backend verifyDeliveryOTP to update status
        try {
            setActionLoading(true);

            // Re-verify OTP with confirmDelivery flag to trigger status update
            const res = await axios.post(`${BACKEND_URL}/api/orders/verify-otp`, {
                orderId,
                otp: otp.trim(),
                confirmDelivery: true // REQUIRED to actually update status on backend
            });

            if (res.data?.success) {
                alert('Order marked as delivered successfully!');
                setOrderDetails(prev => ({
                    ...prev,
                    status: 'Delivered',
                    payment: prev.payment || (prev.paymentMethod === 'COD')
                }));
            } else {
                alert('Failed to mark as delivered: ' + (res.data?.message || 'Unknown error'));
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            setActionLoading(true);
            const res = await axios.post(`${BACKEND_URL}/api/orders/cancel`, {
                orderId
            });

            if (res.data?.success) {
                alert('Order cancelled successfully!');
                setOrderDetails(prev => ({ ...prev, status: 'Cancelled' }));
            } else {
                alert('Failed to cancel order');
            }
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || 'Failed'));
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f9fafb',
            padding: '24px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: verified ? '600px' : '420px',
                background: '#fff',
                borderRadius: '16px',
                padding: '28px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                border: '1px solid #eef2f7',
                transition: 'all 0.3s ease'
            }}>
                {!verified ? (
                    <>
                        <h2 style={{ marginBottom: '8px', fontSize: '22px', fontWeight: 700 }}>Delivery Login</h2>
                        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>
                            Enter the OTP to access delivery details.
                        </p>

                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                            Order ID: <span style={{ color: '#111827', fontWeight: 600 }}>{orderId || 'N/A'}</span>
                        </div>

                        <form onSubmit={handleVerify}>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                style={{
                                    width: '100%',
                                    padding: '12px 14px',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    marginBottom: '14px',
                                    fontSize: '14px'
                                }}
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: '#111827',
                                    color: '#fff',
                                    fontWeight: 600,
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </form>

                        {message && (
                            <div style={{
                                marginTop: '16px',
                                fontSize: '13px',
                                color: message.includes('verified') ? '#16a34a' : '#dc2626'
                            }}>
                                {message}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Delivery Details</h2>
                        </div>

                        {orderDetails ? (
                            <>
                                {/* Customer Info */}
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>Customer Information</h3>
                                    <p style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                        {orderDetails.address?.firstName} {orderDetails.address?.lastName || orderDetails.customerName}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>📧 {orderDetails.email}</p>
                                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>📞 {orderDetails.address?.phone || orderDetails.phoneNumber}</p>
                                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                                        📍 {orderDetails.address?.street}, {orderDetails.address?.city}, {orderDetails.address?.state} - {orderDetails.address?.pincode}
                                    </p>
                                </div>

                                {/* Order Items */}
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase' }}>Order Items ({orderDetails.items?.length || 0})</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {orderDetails.items?.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < orderDetails.items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                                                <div>
                                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</p>
                                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Qty: {item.quantity || 1}</p>
                                                </div>
                                                <p style={{ fontSize: '14px', fontWeight: 600 }}>₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total Amount */}
                                <div style={{ background: '#111827', color: '#fff', padding: '16px', borderRadius: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Amount</span>
                                    <span style={{ fontSize: '22px', fontWeight: 700 }}>₹{(orderDetails.totalAmount || orderDetails.amount || 0).toLocaleString('en-IN')}</span>
                                </div>

                                {/* Payment Status */}
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                                    Payment Method: <span style={{ fontWeight: 600, color: '#111827' }}>{orderDetails.paymentMethod}</span>
                                    <br />
                                    Payment Status: <span style={{ fontWeight: 600, color: orderDetails.payment ? '#10b981' : '#ef4444' }}>{orderDetails.payment ? 'PAID' : 'PENDING'}</span>
                                    <br />
                                    Order Status: <span style={{ fontWeight: 600, color: '#111827' }}>{orderDetails.status}</span>
                                </div>

                                {orderDetails.status !== 'Delivered' && orderDetails.status !== 'Cancelled' && (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={handleMarkDelivered}
                                            disabled={actionLoading}
                                            style={{
                                                flex: 1,
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: 'none',
                                                background: '#10b981',
                                                color: '#fff',
                                                fontWeight: 600,
                                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '15px'
                                            }}
                                        >
                                            {actionLoading ? 'Processing...' : 'Mark as Delivered'}
                                        </button>

                                        <button
                                            onClick={handleCancelOrder}
                                            disabled={actionLoading}
                                            style={{
                                                flex: 1,
                                                padding: '14px',
                                                borderRadius: '10px',
                                                border: '2px solid #ef4444',
                                                background: '#fff',
                                                color: '#ef4444',
                                                fontWeight: 600,
                                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                fontSize: '15px'
                                            }}
                                        >
                                            Cancel Order
                                        </button>
                                    </div>
                                )}

                                {(orderDetails.status === 'Delivered' || orderDetails.status === 'Cancelled') && (
                                    <div style={{
                                        padding: '14px',
                                        borderRadius: '10px',
                                        background: orderDetails.status === 'Delivered' ? '#d1fae5' : '#fee2e2',
                                        color: orderDetails.status === 'Delivered' ? '#065f46' : '#991b1b',
                                        fontWeight: 600,
                                        textAlign: 'center'
                                    }}>
                                        Order {orderDetails.status}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p style={{ color: '#6b7280' }}>No order details found.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default DeliveryLogin;
