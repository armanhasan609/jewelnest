import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Trash2, Phone, Mail, Eye, X, User, MessageSquare, Calendar, AlertCircle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';

const Inquiries = ({ token }) => {
    const [messages, setMessages] = useState([]);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            // Fallback to localStorage if token prop is missing
            const activeToken = token || localStorage.getItem('token');

            if (!activeToken) {
                toast.error("No token found. Please login again.");
                setLoading(false);
                return;
            }

            console.log("Fetching from:", `${backendUrl}/api/contact`);
            console.log("Token:", activeToken?.substring(0, 20) + "...");

            const response = await axios.get(`${backendUrl}/api/contact`, {
                headers: {
                    'token': activeToken,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            console.log("Full response:", response.data);

            if (response.data.success) {
                const messagesData = response.data.data || response.data.messages || [];
                console.log("Messages data:", messagesData);
                setMessages(Array.isArray(messagesData) ? messagesData : []);
            } else {
                console.warn("Response not successful:", response.data.message);
                setMessages([]);
                toast.error(response.data.message || "No data received");
            }
        } catch (error) {
            console.error("Full error object:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error message:", error.message);
            console.error("Error status:", error.response?.status);

            // More specific error messages
            if (error.message === 'Network Error') {
                toast.error("Network error - Cannot connect to backend. Check if server is running on " + backendUrl);
            } else if (error.response?.status === 401) {
                toast.error("Unauthorized - Token may be invalid or expired");
            } else if (error.response?.status === 403) {
                toast.error("Forbidden - You don't have permission to view inquiries");
            } else if (error.response?.status === 404) {
                toast.error("Endpoint not found - Check backend routes");
            } else if (error.response?.status === 500) {
                toast.error("Server error - " + (error.response?.data?.message || "Please check backend logs"));
            } else {
                toast.error(error.response?.data?.message || "Failed to fetch inquiries: " + error.message);
            }

            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, [token]);

    const handleDeleteInquiry = async (inquiryId) => {
        setDeleting(true);
        try {
            const activeToken = token || localStorage.getItem('token');
            console.log("Deleting inquiry:", inquiryId);

            if (!activeToken) {
                toast.error("No token found. Please login again.");
                return;
            }

            // Changed to DELETE method with ID in URL path
            const response = await axios.delete(
                `${backendUrl}/api/contact/${inquiryId}`,
                {
                    headers: { token: activeToken }
                }
            );

            console.log("Delete response:", response.data);

            if (response.data.success) {
                toast.success("Inquiry deleted successfully!");
                // Remove from local state
                setMessages(prev => prev.filter(msg => msg._id !== inquiryId));

                // If deleted inquiry was selected, clear selection
                if (selectedInquiry && selectedInquiry._id === inquiryId) {
                    setSelectedInquiry(null);
                }
            } else {
                toast.error(response.data.message || "Failed to delete inquiry");
            }
        } catch (error) {
            console.error("Delete error:", error.response?.data || error);

            // More specific error messages
            if (error.response?.status === 404) {
                toast.error("Inquiry not found or already deleted");
            } else if (error.response?.status === 401) {
                toast.error("Unauthorized. Please login again");
            } else if (error.response?.status === 500) {
                toast.error("Server error. Please try again");
            } else if (error.response?.status === 400) {
                toast.error("Bad request. Please check the inquiry ID");
            } else {
                toast.error(error.response?.data?.message || "Failed to delete inquiry");
            }
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
            setInquiryToDelete(null);
        }
    };

    const confirmDelete = (inquiry) => {
        setInquiryToDelete(inquiry);
        setShowDeleteConfirm(true);
    };

    const handleSelectInquiry = async (inquiry) => {
        setSelectedInquiry(inquiry);
        
        // If the inquiry is unread, mark it as read automatically when opened
        if (inquiry.status === 'unread') {
            try {
                const activeToken = token || localStorage.getItem('token');
                const response = await axios.put(
                    `${backendUrl}/api/contact/${inquiry._id}`,
                    { status: 'read' },
                    { headers: { token: activeToken } }
                );

                if (response.data.success) {
                    // Update the local state to show it as read
                    setMessages(prev => prev.map(msg => 
                        msg._id === inquiry._id ? { ...msg, status: 'read' } : msg
                    ));
                    // Update the selected inquiry object if it hasn't changed
                    setSelectedInquiry(prev => 
                        prev && prev._id === inquiry._id ? { ...prev, status: 'read' } : prev
                    );
                }
            } catch (error) {
                console.error("Failed to mark inquiry as read:", error);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'read': return '#10b981';
            case 'unread': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'read': return <CheckCircle size={12} />;
            case 'unread': return <AlertCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filterButtonStyle = (active) => ({
        padding: '8px 16px',
        borderRadius: '20px',
        border: 'none',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: active ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : '#f1f5f9',
        color: active ? 'white' : '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    });

    const LoadingScreen = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '24px'
        }}>
            <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f1f5f9',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }} />
            <div style={{ textAlign: 'center' }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '8px'
                }}>
                    Loading Inquiries
                </h3>
                <p style={{
                    fontSize: '14px',
                    color: '#64748b'
                }}>
                    Fetching customer messages...
                </p>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '20px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <MessageSquare size={32} color="#94a3b8" />
            </div>
            <div>
                <h3 style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#334155',
                    marginBottom: '8px'
                }}>
                    No Inquiries Yet
                </h3>
                <p style={{
                    fontSize: '14px',
                    color: '#64748b',
                    maxWidth: '400px'
                }}>
                    Customer inquiries will appear here when they contact you through the contact form.
                </p>
            </div>
        </div>
    );

    const filteredMessages = messages && Array.isArray(messages)
        ? messages.filter(msg => {
            if (statusFilter === 'all') return true;
            return msg.status === statusFilter;
        })
        : [];

    return (
        <div className="page-container">
            <style>{`
                .page-container {
                    padding: 32px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    min-height: 100vh;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .header-container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    gap: 24px;
                }

                .title-text {
                    font-size: 32px;
                    font-weight: 800;
                    background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -0.025em;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                    margin-bottom: 32px;
                }

                .content-container {
                     display: flex;
                     gap: 32px;
                     height: calc(100vh - 280px);
                }

                .inquiries-list {
                    flex: 1;
                    min-width: 320px;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
                    overflow: hidden;
                    transition: flex 0.3s ease;
                }

                .details-panel {
                    flex: 2;
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    animation: slideIn 0.3s ease-out;
                    overflow-y: auto;
                }

                @media (max-width: 1024px) {
                    .page-container {
                        padding: 16px;
                    }
                    
                    .header-container {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                        margin-bottom: 24px;
                    }

                    .title-text {
                        font-size: 24px;
                    }

                    .stats-grid {
                         grid-template-columns: 1fr;
                         gap: 12px;
                    }
                    
                    .content-container {
                        height: calc(100vh - 200px); /* Adjust height for mobile */
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes slideIn {
                    from { transform: translateX(20px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '20px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            }}>
                                <AlertCircle size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }}>
                                    Delete Inquiry
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginTop: '4px'
                                }}>
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <p style={{
                            fontSize: '15px',
                            color: '#475569',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            Are you sure you want to delete the inquiry from <strong>{inquiryToDelete?.name}</strong> regarding <strong>"{inquiryToDelete?.subject}"</strong>?
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setInquiryToDelete(null);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteInquiry(inquiryToDelete._id)}
                                disabled={deleting}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                    opacity: deleting ? 0.7 : 1,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {deleting ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="header-container">
                <div style={{ width: isMobile ? '100%' : 'auto' }}>
                    <h1 className="title-text">Customer Inquiries</h1>
                    <p style={{
                        fontSize: '15px',
                        color: '#64748b',
                        marginTop: '8px',
                        maxWidth: '600px'
                    }}>
                        Manage and respond to customer messages and support requests
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '8px',
                    backgroundColor: 'white',
                    padding: '6px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: isMobile ? 'center' : 'flex-start',
                    flexWrap: 'wrap'
                }}>
                    {['all', 'unread', 'read'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            style={filterButtonStyle(statusFilter === filter)}
                            onMouseEnter={(e) => {
                                if (statusFilter !== filter) {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (statusFilter !== filter) {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                }
                            }}
                        >
                            {filter === 'unread' && <AlertCircle size={12} />}
                            {filter === 'read' && <CheckCircle size={12} />}
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview */}
            {(!isMobile || !selectedInquiry) && (
                <div className="stats-grid">
                    {[
                        { label: 'Total Inquiries', value: messages.length, color: '#3b82f6', icon: <MessageSquare size={20} /> },
                        { label: 'Unread', value: messages.filter(m => m.status === 'unread').length, color: '#f59e0b', icon: <AlertCircle size={20} /> },
                        { label: 'Resolved', value: messages.filter(m => m.status === 'read').length, color: '#10b981', icon: <CheckCircle size={20} /> }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
                                backdropFilter: 'blur(10px)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
                                transition: 'all 0.3s ease',
                                borderLeft: `4px solid ${stat.color}`
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px'
                            }}>
                                <div>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        fontWeight: '500',
                                        marginBottom: '4px'
                                    }}>
                                        {stat.label}
                                    </p>
                                    <h2 style={{
                                        fontSize: '32px',
                                        fontWeight: '700',
                                        color: '#1e293b'
                                    }}>
                                        {stat.value}
                                    </h2>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '12px',
                                    backgroundColor: `${stat.color}15`,
                                    color: stat.color
                                }}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <LoadingScreen />
            ) : messages.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="content-container">
                    {/* Inquiries List */}
                    {(!isMobile || !selectedInquiry) && (
                        <div className="inquiries-list">
                            <div style={{
                                padding: '24px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <MessageSquare size={20} /> Recent Inquiries
                                </h3>
                            </div>
                            <div style={{
                                overflowY: 'auto',
                                height: 'calc(100% - 80px)'
                            }}>
                                {filteredMessages.map((item, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '20px',
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'all 0.3s ease',
                                            background: selectedInquiry?._id === item._id ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'transparent',
                                            borderLeft: selectedInquiry?._id === item._id ? '4px solid #3b82f6' : '4px solid transparent'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '12px'
                                        }}>
                                            <div onClick={() => handleSelectInquiry(item)} style={{ cursor: 'pointer', flex: 1 }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: '8px'
                                                }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '12px',
                                                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '16px'
                                                    }}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 style={{
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: '#1e293b',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {item.name}
                                                        </h4>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '13px',
                                                            color: '#64748b'
                                                        }}>
                                                            <Mail size={12} /> {item.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '11px',
                                                    color: getStatusColor(item.status),
                                                    fontWeight: '600',
                                                    padding: '6px 12px',
                                                    backgroundColor: `${getStatusColor(item.status)}15`,
                                                    borderRadius: '20px'
                                                }}>
                                                    {getStatusIcon(item.status)}
                                                    {item.status || 'pending'}
                                                </div>
                                                <button
                                                    onClick={() => confirmDelete(item)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        border: '1px solid #fee2e2',
                                                        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                                        color: '#dc2626',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        <div onClick={() => handleSelectInquiry(item)} style={{ cursor: 'pointer' }}>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#475569',
                                                marginBottom: '12px',
                                                fontWeight: '500'
                                            }}>
                                                {item.subject}
                                            </div>

                                            <div style={{
                                                fontSize: '13px',
                                                color: '#64748b',
                                                lineHeight: '1.5',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                marginBottom: '16px'
                                            }}>
                                                {item.message}
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '12px',
                                                color: '#94a3b8'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}>
                                                    <Phone size={12} />
                                                    {item.userId?.phoneNumber || 'No phone provided'}
                                                </div>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    <Calendar size={12} />
                                                    {formatDate(item.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Inquiry Details Panel */}
                    {selectedInquiry && (
                        <div className="details-panel">
                            {isMobile && (
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: 'none',
                                        border: 'none',
                                        color: '#3b82f6',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        marginBottom: '16px',
                                        padding: 0
                                    }}
                                >
                                    <ArrowLeft size={20} />
                                    Back to Inquiries
                                </button>
                            )}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '32px',
                                paddingBottom: '20px',
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <h3 style={{
                                    fontSize: isMobile ? '20px' : '24px',
                                    fontWeight: '700',
                                    color: '#1e293b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '8px',
                                        height: '32px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        borderRadius: '4px'
                                    }} />
                                    Inquiry Details
                                </h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => confirmDelete(selectedInquiry)}
                                        style={{
                                            padding: '10px',
                                            borderRadius: '10px',
                                            border: '1px solid #fee2e2',
                                            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                            color: '#dc2626',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)';
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => setSelectedInquiry(null)}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            color: '#64748b'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                                            e.currentTarget.style.transform = 'rotate(90deg)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = 'white';
                                            e.currentTarget.style.transform = 'rotate(0deg)';
                                        }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                flex: 1,
                                overflowY: 'auto'
                            }}>
                                {/* Customer Info */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '16px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #dbeafe'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{
                                                padding: '10px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                            }}>
                                                <User size={20} color="white" />
                                            </div>
                                            <div>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#3b82f6',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    Customer
                                                </p>
                                                <h4 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: '#1e293b'
                                                }}>
                                                    {selectedInquiry.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: '#475569'
                                        }}>
                                            <Mail size={16} /> {selectedInquiry.email}
                                        </div>
                                    </div>

                                    <div style={{
                                        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '12px'
                                        }}>
                                            <div style={{
                                                padding: '10px',
                                                borderRadius: '12px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                            }}>
                                                <Phone size={20} color="white" />
                                            </div>
                                            <div>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#059669',
                                                    fontWeight: '600',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.05em'
                                                }}>
                                                    Registered Phone
                                                </p>
                                                <h4 style={{
                                                    fontSize: '18px',
                                                    fontWeight: '700',
                                                    color: '#065f46'
                                                }}>
                                                    {selectedInquiry.userId?.phoneNumber || 'Not Provided'}
                                                </h4>
                                            </div>
                                        </div>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            fontStyle: 'italic'
                                        }}>
                                            Phone number from registered account
                                        </p>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Subject
                                    </label>
                                    <div style={{
                                        padding: '16px',
                                        background: '#f8fafc',
                                        borderRadius: '12px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#3b82f6'
                                    }}>
                                        {selectedInquiry.subject}
                                    </div>
                                </div>

                                {/* Message */}
                                <div style={{ flex: 1 }}>
                                    <label style={{
                                        fontSize: '12px',
                                        color: '#6b7280',
                                        fontWeight: '600',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        marginBottom: '8px',
                                        display: 'block'
                                    }}>
                                        Message
                                    </label>
                                    <div style={{
                                        padding: '24px',
                                        background: '#f8fafc',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '15px',
                                        color: '#475569',
                                        lineHeight: '1.6',
                                        minHeight: '200px',
                                        overflowY: 'auto',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {selectedInquiry.message}
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    paddingTop: '20px',
                                    borderTop: '2px solid #f1f5f9',
                                    fontSize: '13px',
                                    color: '#94a3b8'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <Calendar size={14} />
                                        Received: {formatDate(selectedInquiry.createdAt)}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        backgroundColor: `${getStatusColor(selectedInquiry.status)}15`,
                                        color: getStatusColor(selectedInquiry.status),
                                        borderRadius: '20px',
                                        fontWeight: '600'
                                    }}>
                                        {getStatusIcon(selectedInquiry.status)}
                                        Status: {selectedInquiry.status || 'pending'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Inquiries;