import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Search, Filter, Download, Eye, MoreVertical,
    Package, CheckCircle, Truck, XCircle,
    Clock, AlertCircle, DollarSign, Users,
    ChevronLeft, ChevronRight, RefreshCw, Printer, Mail, Phone, MapPin, Calendar
} from 'lucide-react';

const Orders = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
    });
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentOrderDetails, setCurrentOrderDetails] = useState(null);
    const [deliveryQrOrder, setDeliveryQrOrder] = useState(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchOrders();
    }, [pagination.page, statusFilter, search]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/orders/list`, {
                headers: { token },
                params: {
                    page: pagination.page,
                    limit: pagination.limit,
                    status: statusFilter !== 'all' ? statusFilter : '',
                    search
                }
            });

            if (response.data.success) {
                const normalizedOrders = response.data.orders.map(order => ({
                    ...order,
                    items: normalizeOrderItems(order.items),
                    date: order.date ? new Date(order.date) : new Date(),
                    formattedDate: formatDate(order.date)
                }));
                setOrders(normalizedOrders);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.pagination?.total || normalizedOrders.length,
                    pages: response.data.pagination?.pages || 1
                }));
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const getDeliveryQrUrl = (orderId) => {
        const deliveryLoginUrl = `${window.location.origin}/delivery/login?orderId=${orderId}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(deliveryLoginUrl)}`;
    };

    const normalizeOrderItems = (items = []) => {
        if (!items) return [];

        const itemsArray = Array.isArray(items) ? items : [items];

        return itemsArray.map((item) => {
            const images = [];

            if (Array.isArray(item.images)) {
                images.push(...item.images.filter(img => img));
            } else if (Array.isArray(item.image)) {
                images.push(...item.image.filter(img => img));
            } else if (item.images) {
                images.push(item.images);
            } else if (item.image) {
                images.push(item.image);
            } else if (item.imageUrl) {
                images.push(item.imageUrl);
            }

            const cleanedImages = images.filter(img => img && typeof img === 'string');

            return {
                ...item,
                images: cleanedImages,
                image: cleanedImages[0] || '',
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 1
            };
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchOrderDetails = (orderId) => {
        navigate(`/admin/order-details/${orderId}`);
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${BACKEND_URL}/api/orders/status`,
                { orderId, status },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success(`Order status updated to ${status}`);

                if (status === 'Out for delivery') {
                    const order = orders.find(o => o._id === orderId);
                    if (order && order.email) {
                        await sendDeliveryOTP(orderId, order.email);
                    }
                    setDeliveryQrOrder(order || { _id: orderId });
                }

                fetchOrders();

                if (currentOrderDetails && currentOrderDetails._id === orderId) {
                    setCurrentOrderDetails(prev => ({
                        ...prev,
                        status: status
                    }));
                }
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const sendDeliveryOTP = async (orderId, email) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${BACKEND_URL}/api/orders/send-otp`,
                { orderId, email },
                { headers: { token } }
            );

            if (response.data.success) {
                toast.success('Delivery OTP sent successfully!');
            }
        } catch (error) {
            toast.error('Failed to send OTP');
        }
    };

    const exportOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BACKEND_URL}/api/orders/export`, {
                headers: { token },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export orders');
        }
    };

    const printOrder = (order) => {
        const printWindow = window.open('', '_blank');

        const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = subtotal < 499 ? 50 : 0;
        const total = subtotal + deliveryCharge;

        const itemsHTML = order.items.map(item => `
            <tr>
                <td style="padding: 4px; border-bottom: 1px solid #ddd;">
                    <img src="${item.images?.[0] || item.image || ''}" 
                         alt="${item.name}" 
                         style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                </td>
                <td style="padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px;">${item.name}</td>
                <td style="padding: 4px; border-bottom: 1px solid #ddd; text-align: center; font-size: 10px;">${item.quantity}</td>
                <td style="padding: 4px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10px;">₹${item.price.toLocaleString('en-IN')}</td>
                <td style="padding: 4px; border-bottom: 1px solid #ddd; text-align: right; font-size: 10px;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
            </tr>
        `).join('');

        const qrCodeUrl = getDeliveryQrUrl(order._id);

        const formatAddress = (addr) => {
            if (!addr) return 'N/A';
            if (typeof addr === 'string') return addr;
            return [
                addr.firstName && addr.lastName ? `${addr.firstName} ${addr.lastName}` : '',
                addr.street,
                addr.nearbyLocation,
                addr.city,
                addr.state,
                addr.pincode || addr.zipcode || addr.zipCode,
                addr.country
            ].filter(Boolean).join(', ');
        };

        const formattedAddress = formatAddress(order.address);

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Order Invoice #${order._id.slice(-8)}</title>
                <style>
                    @page { size: auto; margin: 5mm; }
                    body { font-family: Arial, sans-serif; margin: 10px; font-size: 10px; line-height: 1.2; }
                    .header { text-align: center; margin-bottom: 10px; border-bottom: 1px solid #000; padding-bottom: 10px; position: relative; }
                    .qr-code { position: absolute; right: 0; top: 0; text-align: center; }
                    .qr-code img { width: 66px; height: 66px; }
                    h1 { font-size: 16px; margin: 5px 0; }
                    h3 { font-size: 12px; margin: 5px 0; }
                    .section { margin-bottom: 10px; }
                    .section-title { background: #f5f5f5; padding: 4px; font-weight: bold; margin-bottom: 5px; font-size: 11px; }
                    p { margin: 2px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 5px 0; }
                    th { background: #f8f9fa; padding: 4px; text-align: left; font-weight: bold; border-bottom: 1px solid #ddd; font-size: 10px; }
                    td { padding: 4px; border-bottom: 1px solid #ddd; font-size: 10px; }
                    .total-row td { font-weight: bold; font-size: 11px; background: #f8f9fa; }
                    .status-badge { 
                        padding: 2px 8px; 
                        border-radius: 10px; 
                        font-size: 9px; 
                        font-weight: bold;
                        display: inline-block;
                    }
                    .status-placed { background: #e3f2fd; color: #1565c0; }
                    .status-processing { background: #fff3e0; color: #ef6c00; }
                    .status-shipped { background: #f3e5f5; color: #7b1fa2; }
                    .status-delivered { background: #e8f5e8; color: #2e7d32; }
                    .status-cancelled { background: #ffebee; color: #c62828; }
                    .footer-qr { width: 100px; height: 100px; }
                    @media print {
                        .no-print { display: none; }
                        body { margin: 0; }
                        .qr-code { position: absolute; right: 0; top: 0; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="qr-code">
                        <img src="${qrCodeUrl}" alt="Delivery QR" />
                        <div style="font-size: 8px;">Driver Scan</div>
                    </div>
                    <h1>JewelNest Invoice</h1>
                    <h3>Order #${order._id.slice(-8)}</h3>
                    <p>Date: ${order.formattedDate}</p>
                    <div class="status-badge status-${order.status.toLowerCase().replace(' ', '-')}">
                        ${order.status}
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; font-size: 10px;">
                    <div class="section" style="flex: 1;">
                        <div class="section-title">Sold By</div>
                        <p><strong>JewelNest</strong></p>
                        <p>JewelNest, Banipur, Murshidabad<br />
                                            West Bengal, India - 742235</p>
                        <p>jewelnest86@gmail.com</p>
                    </div>
                    <div class="section" style="flex: 1;">
                        <div class="section-title">Bill To</div>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Email:</strong> ${order.email}</p>
                        <p><strong>Phone:</strong> ${order.phoneNumber}</p>
                    </div>
                    <div class="section" style="flex: 1;">
                        <div class="section-title">Shipping Address</div>
                        <p>${formattedAddress}</p>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Order Items</div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50px;">Image</th>
                                <th>Product</th>
                                <th style="text-align: center;">Qty</th>
                                <th style="text-align: right;">Price</th>
                                <th style="text-align: right;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHTML}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" style="text-align: right; font-weight: bold;">Subtotal:</td>
                                <td style="text-align: right;">₹${subtotal.toLocaleString('en-IN')}</td>
                            </tr>
                            <tr>
                                <td colspan="4" style="text-align: right; font-weight: bold;">Delivery:</td>
                                <td style="text-align: right;">${deliveryCharge === 0 ? 'Free' : '₹' + deliveryCharge}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="4" style="text-align: right;">Grand Total:</td>
                                <td style="text-align: right;">₹${total.toLocaleString('en-IN')}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                <div class="section" style="margin-top: 5px; border-top: 1px dashed #ccc; padding-top: 5px; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div class="section-title" style="display: inline-block; margin: 0;">Payment:</div>
                        <span style="font-size: 10px;"> ${order.paymentMethod} (${order.payment ? 'Paid' : 'Pending'})</span>
                    </div>
                    <div style="text-align: center;">
                         <img src="${qrCodeUrl}" alt="Delivery QR" class="footer-qr" />
                         <div style="font-size: 8px;">Delivery Verification</div>
                    </div>
                </div>
                
                <div class="no-print" style="margin-top: 10px; text-align: center;">
                    <button onclick="window.print()" style="padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                        Print
                    </button>
                    <button onclick="window.close()" style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 12px;">
                        Close
                    </button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Order Placed': return <Clock size={16} style={{ color: '#3b82f6' }} />;
            case 'Processing': return <Package size={16} style={{ color: '#eab308' }} />;
            case 'Shipped': return <Truck size={16} style={{ color: '#a855f7' }} />;
            case 'Out for delivery': return <Truck size={16} style={{ color: '#f97316' }} />;
            case 'Delivered': return <CheckCircle size={16} style={{ color: '#22c55e' }} />;
            case 'Cancelled': return <XCircle size={16} style={{ color: '#ef4444' }} />;
            default: return <AlertCircle size={16} style={{ color: '#6b7280' }} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Order Placed': return { backgroundColor: '#dbeafe', color: '#1e40af' };
            case 'Processing': return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'Shipped': return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
            case 'Out for delivery': return { backgroundColor: '#ffedd5', color: '#c2410c' };
            case 'Delivered': return { backgroundColor: '#dcfce7', color: '#166534' };
            case 'Cancelled': return { backgroundColor: '#fee2e2', color: '#991b1b' };
            default: return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    };

    const calculateStats = () => {
        const allOrders = orders;
        return {
            total: allOrders.length,
            totalRevenue: allOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0),
            pending: allOrders.filter(o => o.status === 'Order Placed').length,
            processing: allOrders.filter(o => o.status === 'Processing').length,
            shipped: allOrders.filter(o => o.status === 'Shipped').length,
            outForDelivery: allOrders.filter(o => o.status === 'Out for delivery').length,
            delivered: allOrders.filter(o => o.status === 'Delivered').length,
            cancelled: allOrders.filter(o => o.status === 'Cancelled').length,
            activeCustomers: [...new Set(allOrders.map(o => o.userId))].length
        };
    };

    const stats = calculateStats();

    if (loading && orders.length === 0) {
        return (
            <div style={{ padding: '32px', textAlign: 'center' }}>
                <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '50%',
                    height: '48px',
                    width: '48px',
                    borderBottom: '2px solid #ca8a04',
                    margin: '0 auto'
                }}></div>
                <p style={{ marginTop: '16px', color: '#4b5563' }}>Loading orders...</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Delivery QR Modal */}
            {deliveryQrOrder && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 50,
                    padding: '16px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '384px',
                        width: '100%',
                        textAlign: 'center',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: '#111827'
                            }}>Delivery Package QR</h3>
                            <button
                                onClick={() => setDeliveryQrOrder(null)}
                                style={{
                                    color: '#9ca3af',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div style={{
                            backgroundColor: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '2px dashed #d1d5db',
                            display: 'inline-block',
                            marginBottom: '24px'
                        }}>
                            <img
                                src={getDeliveryQrUrl(deliveryQrOrder._id)}
                                alt="Delivery QR Code"
                                style={{ width: '192px', height: '192px', objectFit: 'contain' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <p style={{ fontWeight: '600', fontSize: '18px', color: '#1f2937' }}>
                                Order #{deliveryQrOrder._id.slice(-8)}
                            </p>
                            <p style={{ fontSize: '14px', color: '#6b7280' }}>
                                Provide this QR code to the delivery agent for package verification.
                            </p>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => window.open(getDeliveryQrUrl(deliveryQrOrder._id), '_blank')}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                            >
                                Download QR
                            </button>
                            <button
                                onClick={() => printOrder(deliveryQrOrder)}
                                style={{
                                    flex: 1,
                                    padding: '8px 16px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'}
                                onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                            >
                                <Printer size={18} />
                                Print Label
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Stats */}
            <div className="stats-grid">
                {/* Total Orders Card */}
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="stats-label">Total Orders</p>
                            <p className="stats-value">
                                {stats.total}
                            </p>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px' }}>
                            <Package size={24} style={{ color: '#2563eb' }} />
                        </div>
                    </div>
                </div>

                {/* Total Revenue Card */}
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="stats-label">Total Revenue</p>
                            <p className="stats-value">
                                ₹{stats.totalRevenue.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                            <DollarSign size={24} style={{ color: '#16a34a' }} />
                        </div>
                    </div>
                </div>

                {/* Pending Orders Card */}
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="stats-label">Pending Orders</p>
                            <p className="stats-value">
                                {stats.pending}
                            </p>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
                            <Clock size={24} style={{ color: '#d97706' }} />
                        </div>
                    </div>
                </div>

                {/* Active Customers Card */}
                <div className="stats-card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <p className="stats-label">Active Customers</p>
                            <p className="stats-value">
                                {stats.activeCustomers}
                            </p>
                        </div>
                        <div style={{ padding: '12px', backgroundColor: '#f3e8ff', borderRadius: '8px' }}>
                            <Users size={24} style={{ color: '#9333ea' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="filter-section">
                <div className="filters-container">
                    <div style={{ flex: 1, width: '100%' }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#9ca3af'
                            }} size={20} />
                            <input
                                type="text"
                                placeholder="Search orders..."
                                className="search-input"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="filter-actions">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <Filter size={18} style={{ color: '#6b7280' }} />
                            <select
                                className="status-select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Order Placed">Order Placed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={exportOrders}
                                className="action-button"
                            >
                                <Download size={18} />
                                <span className="button-text">Export</span>
                            </button>

                            <button
                                onClick={fetchOrders}
                                className="icon-button"
                                title="Refresh"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: '#f9fafb' }}>
                            <tr>
                                <th className="table-header">
                                    Order ID
                                </th>
                                <th className="table-header">
                                    Customer
                                </th>
                                <th className="table-header">
                                    Items
                                </th>
                                <th className="table-header">
                                    Amount
                                </th>
                                <th className="table-header">
                                    Status
                                </th>
                                <th className="table-header">
                                    Date
                                </th>
                                <th className="table-header">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody style={{ backgroundColor: 'white' }}>
                            {orders.map((order) => {
                                const statusColor = getStatusColor(order.status);
                                return (
                                    <tr key={order._id} style={{
                                        borderBottom: '1px solid #e5e7eb',
                                        transition: 'background-color 0.2s'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <td className="table-cell">
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                                                #{order._id.slice(-8)}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {order.paymentMethod}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                                                {order.customerName}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {order.email}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                                {order.phoneNumber}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div style={{ fontSize: '14px', color: '#111827' }}>
                                                {order.items?.length || 0} items
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '320px'
                                            }}>
                                                {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                                                {order.items?.length > 2 && '...'}
                                            </div>
                                        </td>
                                        <td className="table-cell" style={{ whiteSpace: 'nowrap' }}>
                                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827' }}>
                                                ₹{parseFloat(order.totalAmount || 0).toLocaleString('en-IN')}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                padding: '4px 8px',
                                                borderRadius: '9999px',
                                                display: 'inline-block',
                                                marginTop: '4px',
                                                backgroundColor: order.payment ? '#dcfce7' : '#fef3c7',
                                                color: order.payment ? '#166534' : '#92400e'
                                            }}>
                                                {order.payment ? 'Paid' : 'Pending'}
                                            </div>
                                        </td>
                                        <td className="table-cell" style={{ whiteSpace: 'nowrap' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {getStatusIcon(order.status)}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '9999px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        ...statusColor,
                                                        outline: 'none'
                                                    }}
                                                >
                                                    <option value="Order Placed">Order Placed</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Out for delivery">Out for Delivery</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="table-cell" style={{ whiteSpace: 'nowrap', color: '#6b7280' }}>
                                            {order.formattedDate}
                                        </td>
                                        <td className="table-cell" style={{ whiteSpace: 'nowrap', fontWeight: '500' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => fetchOrderDetails(order._id)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        transition: 'background-color 0.2s',
                                                        color: '#2563eb'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#dbeafe'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => printOrder(order)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        transition: 'background-color 0.2s',
                                                        color: '#4b5563'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    title="Print Invoice"
                                                >
                                                    <Printer size={18} />
                                                </button>
                                                <button
                                                    onClick={() => sendDeliveryOTP(order._id, order.email)}
                                                    style={{
                                                        padding: '8px',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        borderRadius: '8px',
                                                        transition: 'background-color 0.2s',
                                                        color: '#16a34a'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.backgroundColor = '#dcfce7'}
                                                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    title="Send OTP"
                                                >
                                                    <Mail size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="pagination-container">
                        <div style={{ fontSize: '14px', color: '#374151' }}>
                            Showing page {pagination.page} of {pagination.pages}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                disabled={pagination.page === 1}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: 'none',
                                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page === 1 ? 0.5 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (pagination.page !== 1) {
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (pagination.page !== 1) {
                                        e.target.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                let pageNum;
                                if (pagination.pages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.pages - 2) {
                                    pageNum = pagination.pages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                        style={{
                                            padding: '4px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid #d1d5db',
                                            background: pagination.page === pageNum ? '#ca8a04' : 'transparent',
                                            color: pagination.page === pageNum ? 'white' : '#374151',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => {
                                            if (pagination.page !== pageNum) {
                                                e.target.style.backgroundColor = '#f9fafb';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (pagination.page !== pageNum) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                                disabled={pagination.page === pagination.pages}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: '1px solid #d1d5db',
                                    background: 'none',
                                    cursor: pagination.page === pagination.pages ? 'not-allowed' : 'pointer',
                                    opacity: pagination.page === pagination.pages ? 0.5 : 1,
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseOver={(e) => {
                                    if (pagination.page !== pagination.pages) {
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (pagination.page !== pagination.pages) {
                                        e.target.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {orders.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Package style={{ margin: '0 auto', color: '#d1d5db' }} size={64} />
                    <h3 style={{ marginTop: '16px', fontSize: '18px', fontWeight: '500', color: '#111827' }}>
                        No orders found
                    </h3>
                    <p style={{ marginTop: '8px', color: '#6b7280' }}>
                        {search || statusFilter !== 'all'
                            ? 'Try changing your search or filters'
                            : 'No orders have been placed yet'}
                    </p>
                </div>
            )}

            <style>
                {`
                .page-container {
                    padding: 16px;
                    background-color: #f9fafb;
                    min-height: 100vh;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .stats-card {
                    background-color: white;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
                }

                .stats-label {
                    font-size: 14px;
                    color: #4b5563;
                }

                .stats-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #111827;
                    margin-top: 4px;
                }

                .filter-section {
                    background-color: white;
                    border-radius: 12px;
                    border: 1px solid #e5e7eb;
                    padding: 16px;
                    margin-bottom: 24px;
                }

                .filters-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .search-input {
                    width: 100%;
                    padding: 8px 16px 8px 40px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    outline: none;
                    font-size: 14px;
                    box-sizing: border-box;
                }
                .search-input:focus {
                    border-color: #ca8a04;
                    box-shadow: 0 0 0 2px rgba(202, 138, 4, 0.1);
                }

                .filter-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    width: 100%;
                }

                .status-select {
                    width: 100%;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    padding: 8px 12px;
                    outline: none;
                    background-color: white;
                }
                .status-select:focus {
                    border-color: #ca8a04;
                    box-shadow: 0 0 0 2px rgba(202, 138, 4, 0.1);
                }

                .action-button {
                    padding: 8px 16px;
                    background-color: #f3f4f6;
                    color: #374151;
                    border-radius: 8px;
                    font-weight: 500;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color 0.2s;
                }
                .action-button:hover {
                    background-color: #e5e7eb;
                }

                .icon-button {
                    padding: 8px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: background-color 0.2s;
                    color: #4b5563;
                }
                .icon-button:hover {
                    background-color: #f3f4f6;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Tablet & Desktop */
                @media (min-width: 768px) {
                    .page-container {
                        padding: 24px;
                    }
                    
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 24px;
                        margin-bottom: 32px;
                    }

                    .stats-card {
                        padding: 24px;
                    }

                    .stats-value {
                        font-size: 24px;
                    }

                    .filter-section {
                        padding: 24px;
                    }

                    .filters-container {
                        flex-direction: row;
                        align-items: center;
                        justify-content: space-between;
                    }

                    .filter-actions {
                        flex-direction: row;
                        width: auto;
                        align-items: center;
                        gap: 16px;
                    }

                    .status-select {
                        width: auto;
                    }
                }
                
                @media (min-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(4, 1fr);
                    }
                }

                @media (max-width: 640px) {
                    .button-text {
                        display: none;
                    }
                    .action-button {
                        padding: 8px;
                    }
                }

                .table-header {
                    padding: 12px 24px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    color: #6b7280;
                    white-space: nowrap;
                    background-color: #f9fafb;
                }
                
                .table-cell {
                     padding: 16px 24px;
                     vertical-align: top;
                     border-bottom: 1px solid #e5e7eb;
                }

                .pagination-container {
                    padding: 16px 24px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                @media (max-width: 768px) {
                    .table-header, .table-cell {
                        padding: 12px 16px;
                    }
                    
                    /* Make table scrollable on mobile */
                    .table-container {
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }

                    .pagination-container {
                        flex-direction: column;
                        gap: 16px;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default Orders;