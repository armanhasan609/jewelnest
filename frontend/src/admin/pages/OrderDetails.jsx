import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    X, Package, User, Phone, MapPin, Calendar,
    DollarSign, CheckCircle, Truck, Home,
    ChevronLeft, ChevronRight, Download, Printer, ArrowLeft
} from 'lucide-react';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState({});
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

    useEffect(() => {
        if (orderId) fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/orders/list`, {
                headers: { token }
            });

            if (response.data.success) {
                // Find specific order from the list
                const foundOrder = response.data.orders.find(o => o._id === orderId);

                if (foundOrder) {
                    // Update normalization logic to handle multiple image sources safely
                    const normalizedOrder = {
                        ...foundOrder,
                        formattedDate: new Date(foundOrder.date).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        }),
                        items: foundOrder.items.map(item => {
                            let images = [];
                            if (Array.isArray(item.images)) {
                                images = item.images;
                            } else if (Array.isArray(item.image)) {
                                images = item.image;
                            } else if (item.images) {
                                images = [item.images];
                            } else if (item.image) {
                                images = [item.image];
                            } else if (item.imageUrl) {
                                images = [item.imageUrl]; // Handle variant naming
                            }

                            // Filter valid strings only
                            images = images.filter(img => img && typeof img === 'string');

                            return {
                                ...item,
                                images: images.length > 0 ? images : []
                            };
                        })
                    };
                    setOrder(normalizedOrder);
                } else {
                    toast.error('Order not found in list');
                }
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to fetch order details');
        } finally {
            setLoading(false);
        }
    };

    const sendDeliveryOTP = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${BACKEND_URL}/api/orders/send-otp`,
                { orderId, email: order.email },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Delivery OTP sent successfully!');
            }
        } catch (error) {
            console.error('OTP Error:', error);
            toast.error('Failed to send OTP');
        }
    };

    const updateOrderStatus = async (status) => {
        try {
            const token = localStorage.getItem('token');
            // Fixed: Use POST, include token, use correct endpoint, use BACKEND_URL
            const response = await axios.post(
                `${BACKEND_URL}/api/orders/status`,
                { orderId, status },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(`Order status updated to ${status}`);
                setOrder(prev => ({ ...prev, status }));

                // Auto-send OTP if status is Out for delivery
                if (status === 'Out for delivery') {
                    await sendDeliveryOTP();
                }
            }
        } catch (error) {
            console.error('Update Status Error:', error);
            toast.error('Failed to update status');
        }
    };

    const nextImage = (itemIndex, totalImages) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [itemIndex]: (prev[itemIndex] + 1) % totalImages
        }));
    };

    const prevImage = (itemIndex, totalImages) => {
        setCurrentImageIndex(prev => ({
            ...prev,
            [itemIndex]: (prev[itemIndex] - 1 + totalImages) % totalImages
        }));
    };

    const printOrder = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
      <html>
        <head>
          <title>Order Invoice #${order?._id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 18px; }
            .status { padding: 5px 10px; border-radius: 20px; font-size: 12px; }
            .status-placed { background: #e0f2fe; color: #0369a1; }
            .status-shipped { background: #fef3c7; color: #92400e; }
            .status-delivered { background: #d1fae5; color: #065f46; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JewelNest Invoice</h1>
            <h3>Order #${order?._id}</h3>
          </div>
          <div class="section">
            <p><strong>Date:</strong> ${order?.formattedDate}</p>
            <p><strong>Status:</strong> <span class="status status-${order?.status.toLowerCase()}">${order?.status}</span></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order?.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₹${item.price}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                <td><strong>₹${order?.totalAmount}</strong></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.print();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Order Placed': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'Processing': return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'Shipped': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
            case 'Out for Delivery': return { backgroundColor: '#ffedd5', color: '#9a3412' };
            case 'Delivered': return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'Cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'Order Placed': { backgroundColor: '#dbeafe', color: '#1e40af' },
            'Processing': { backgroundColor: '#fef3c7', color: '#92400e' },
            'Shipped': { backgroundColor: '#f3e8ff', color: '#6b21a8' },
            'Out for Delivery': { backgroundColor: '#ffedd5', color: '#9a3412' },
            'Delivered': { backgroundColor: '#d1fae5', color: '#065f46' },
            'Cancelled': { backgroundColor: '#fee2e2', color: '#991b1b' }
        };
        const style = colors[status] || { backgroundColor: '#f3f4f6', color: '#374151' };

        return (
            <span style={{
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '500',
                ...style
            }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <div style={{ padding: '32px', textAlign: 'center' }}>Loading details...</div>;
    }

    if (!order) {
        return <div style={{ padding: '32px', textAlign: 'center', color: '#ef4444' }}>Order not found</div>;
    }

    const renderAddress = (address) => {
        if (!address) return 'N/A';
        if (typeof address === 'string') return address;
        return [
            address.street,
            address.city,
            address.state,
            address.pincode || address.zipcode || address.zipCode,
            address.country
        ].filter(Boolean).join(', ');
    };

    const containerStyle = {
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
    };

    const cardStyle = {
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '56rem',
        margin: '0 auto',
        borderRadius: '16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        padding: '24px',
        borderBottom: '1px solid #f3f4f6',
        backgroundColor: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
    };

    const buttonStyle = {
        padding: '8px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '9999px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background-color 0.2s'
    };

    const sectionTitleStyle = {
        fontSize: '18px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };

    const itemCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
    };

    const imageContainerStyle = {
        position: 'relative',
        width: '128px',
        height: '128px',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f3f4f6'
    };

    const navButtonStyle = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '6px',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'background-color 0.2s'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={headerStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{ ...buttonStyle, ':hover': { backgroundColor: '#e5e7eb' } }}
                        >
                            <ArrowLeft size={20} style={{ color: '#4b5563' }} />
                        </button>
                        <div>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#111827',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                Order #{order._id.slice(-8).toUpperCase()}
                                <StatusBadge status={order.status} />
                            </h2>
                            <p style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                marginTop: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Calendar size={14} />
                                {new Date(order.date).toLocaleString()}
                            </p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                            padding: '4px 12px',
                            borderRadius: '9999px',
                            fontSize: '14px',
                            fontWeight: '500',
                            ...getStatusColor(order.status)
                        }}>
                            {order.status}
                        </span>
                        <button
                            onClick={printOrder}
                            style={{ ...buttonStyle, ':hover': { backgroundColor: '#f3f4f6' } }}
                            title="Print Invoice"
                        >
                            <Printer size={20} style={{ color: '#4b5563' }} />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '24px',
                        '@media (min-width: 1024px)': {
                            gridTemplateColumns: '2fr 1fr'
                        }
                    }}>
                        {/* Order Items */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={itemCardStyle}>
                                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                                    <h3 style={sectionTitleStyle}>
                                        Order Items ({order.items.length})
                                    </h3>
                                </div>
                                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                                    {order.items.map((item, index) => (
                                        <div key={index} style={{
                                            padding: '24px',
                                            borderBottom: '1px solid #f3f4f6',
                                            ':hover': { backgroundColor: '#f9fafb' },
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                {/* Image Gallery */}
                                                <div style={{ position: 'relative' }}>
                                                    <div style={imageContainerStyle}>
                                                        {item.images && item.images.length > 0 ? (
                                                            <div style={{ position: 'relative', height: '100%' }}>
                                                                <img
                                                                    src={item.images[currentImageIndex[index] || 0]}
                                                                    alt={item.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = '/placeholder-image.jpg';
                                                                    }}
                                                                />

                                                                {item.images.length > 1 && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => prevImage(index, item.images.length)}
                                                                            style={{ ...navButtonStyle, left: '8px' }}
                                                                        >
                                                                            <ChevronLeft size={18} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => nextImage(index, item.images.length)}
                                                                            style={{ ...navButtonStyle, right: '8px' }}
                                                                        >
                                                                            <ChevronRight size={18} />
                                                                        </button>

                                                                        {/* Image Dots */}
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            bottom: '8px',
                                                                            left: '50%',
                                                                            transform: 'translateX(-50%)',
                                                                            display: 'flex',
                                                                            gap: '6px'
                                                                        }}>
                                                                            {item.images.map((_, imgIndex) => (
                                                                                <div
                                                                                    key={imgIndex}
                                                                                    style={{
                                                                                        width: '6px',
                                                                                        height: '6px',
                                                                                        borderRadius: '9999px',
                                                                                        transition: 'all 0.2s',
                                                                                        backgroundColor: imgIndex === (currentImageIndex[index] || 0)
                                                                                            ? '#d4af37'
                                                                                            : 'rgba(255, 255, 255, 0.6)'
                                                                                    }}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#9ca3af'
                                                            }}>
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>

                                                    {item.images && item.images.length > 1 && (
                                                        <button
                                                            onClick={() => toast.info(`${item.images.length} images available`)}
                                                            style={{
                                                                position: 'absolute',
                                                                bottom: '-8px',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                backgroundColor: 'white',
                                                                padding: '4px 12px',
                                                                borderRadius: '9999px',
                                                                fontSize: '12px',
                                                                fontWeight: '500',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                border: '1px solid #e5e7eb',
                                                                cursor: 'pointer',
                                                                transition: 'background-color 0.2s',
                                                                ':hover': { backgroundColor: '#f9fafb' }
                                                            }}
                                                        >
                                                            {item.images.length} photos
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Item Details */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <h4 style={{ fontWeight: '600', color: '#111827' }}>{item.name}</h4>
                                                            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {(item.sku || item.product?.sku) && (
                                                                    <span>SKU: {item.sku || item.product?.sku}</span>
                                                                )}
                                                                {(item.sku || item.product?.sku) && (item.category || item.product?.category) && (
                                                                    <span>|</span>
                                                                )}
                                                                {(item.category || item.product?.category) && (
                                                                    <span>Category: {item.category || item.product?.category}</span>
                                                                )}
                                                            </div>
                                                            {item.description && (
                                                                <p style={{
                                                                    fontSize: '14px',
                                                                    color: '#6b7280',
                                                                    marginTop: '8px',
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    overflow: 'hidden'
                                                                }}>
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
                                                                ₹{(item.price * item.quantity).toLocaleString()}
                                                            </p>
                                                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                                                ₹{item.price.toLocaleString()} × {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Specifications */}
                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                                        gap: '8px',
                                                        marginTop: '16px',
                                                        fontSize: '14px'
                                                    }}>
                                                        {item.material && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ color: '#6b7280' }}>Material:</span>
                                                                <span style={{ fontWeight: '500' }}>{item.material}</span>
                                                            </div>
                                                        )}
                                                        {item.weight && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{ color: '#6b7280' }}>Weight:</span>
                                                                <span style={{ fontWeight: '500' }}>{item.weight}g</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Summary */}
                                <div style={{ padding: '24px', borderTop: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ color: '#4b5563' }}>Subtotal</p>
                                            <p style={{ color: '#4b5563' }}>Shipping</p>
                                            <p style={{ color: '#4b5563' }}>Tax</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ color: '#111827' }}>₹{order.totalAmount.toLocaleString()}</p>
                                            <p style={{ color: '#111827' }}>FREE</p>
                                            <p style={{ color: '#111827' }}>Included</p>
                                        </div>
                                    </div>
                                    <div style={{
                                        marginTop: '16px',
                                        paddingTop: '16px',
                                        borderTop: '1px solid #e5e7eb',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <p style={{ fontSize: '18px', fontWeight: '600' }}>Total Amount</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#d4af37' }}>
                                            ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Customer Info */}
                            <div style={itemCardStyle}>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={sectionTitleStyle}>
                                        <User style={{ color: '#d4af37' }} />
                                        Customer Information
                                    </h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '9999px',
                                                backgroundColor: '#fdf6e3',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <User style={{ color: '#d4af37' }} size={24} />
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', color: '#111827' }}>{order.customerName}</p>
                                                <p style={{ fontSize: '14px', color: '#6b7280' }}>{order.email}</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                                            <Phone size={18} style={{ color: '#9ca3af' }} />
                                            <span>{order.phoneNumber}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#374151' }}>
                                            <MapPin size={18} style={{ color: '#9ca3af', marginTop: '4px' }} />
                                            <span style={{ fontSize: '14px' }}>{renderAddress(order.address)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Actions */}
                            <div style={itemCardStyle}>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={sectionTitleStyle}>Order Actions</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <button
                                            onClick={() => updateOrderStatus('Processing')}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#eff6ff',
                                                color: '#1d4ed8',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                ':hover': { backgroundColor: '#dbeafe' }
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Mark as Processing
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus('Shipped')}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#faf5ff',
                                                color: '#7c3aed',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                ':hover': { backgroundColor: '#f3e8ff' }
                                            }}
                                        >
                                            <Truck size={18} />
                                            Mark as Shipped
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus('Out for Delivery')}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#fff7ed',
                                                color: '#ea580c',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                ':hover': { backgroundColor: '#ffedd5' }
                                            }}
                                        >
                                            <Truck size={18} />
                                            Out for Delivery
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus('Delivered')}
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                backgroundColor: '#f0fdf4',
                                                color: '#15803d',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                cursor: 'pointer',
                                                transition: 'background-color 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                                ':hover': { backgroundColor: '#dcfce7' }
                                            }}
                                        >
                                            <CheckCircle size={18} />
                                            Mark as Delivered
                                        </button>
                                        {order.status !== 'Cancelled' && (
                                            <button
                                                onClick={() => updateOrderStatus('Cancelled')}
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 16px',
                                                    backgroundColor: '#fef2f2',
                                                    color: '#dc2626',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s',
                                                    ':hover': { backgroundColor: '#fee2e2' }
                                                }}
                                            >
                                                Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div style={itemCardStyle}>
                                <div style={{ padding: '24px' }}>
                                    <h3 style={sectionTitleStyle}>Payment Details</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#6b7280' }}>Payment Method:</span>
                                            <span style={{ fontWeight: '500' }}>{order.paymentMethod}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>Payment Status:</span>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                backgroundColor: order.payment ? '#d1fae5' : '#fef3c7',
                                                color: order.payment ? '#065f46' : '#92400e'
                                            }}>
                                                {order.payment ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#6b7280' }}>Total Amount:</span>
                                            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#d4af37' }}>
                                                ₹{order.totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;