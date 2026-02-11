import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${backendUrl}/api/contact/list`, {
                headers: { token }
            });

            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Fetch messages error:', error);
            toast.error('Failed to fetch messages');
        } finally {
            setLoading(false);
        }
    };

    const viewMessage = async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${backendUrl}/api/contact/${id}`, {
                headers: { token }
            });

            console.log('Message response:', response.data);

            if (response.data.success) {
                setSelectedMessage(response.data.data);

                // If status was changed from unread to read, refresh the list
                if (response.data.statusChanged) {
                    console.log('Status was changed, refreshing list...');
                    fetchMessages();
                    toast.success('Message marked as read');
                }
            }
        } catch (error) {
            console.error('View message error:', error);
            toast.error('Failed to load message');
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const filteredMessages = messages.filter(msg => {
        if (filter === 'all') return true;
        return msg.status === filter;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return '#ef4444';
            case 'read': return '#3b82f6';
            case 'replied': return '#10b981';
            case 'archived': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusBadge = (status) => ({
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '600',
        backgroundColor: `${getStatusColor(status)}20`,
        color: getStatusColor(status),
        textTransform: 'capitalize'
    });

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f4f6',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280' }}>Loading messages...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a202c', marginBottom: '8px' }}>
                    Contact Messages
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Manage customer inquiries and messages
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {['all', 'unread', 'read', 'replied', 'archived'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            backgroundColor: filter === status ? '#1a202c' : 'white',
                            color: filter === status ? 'white' : '#6b7280',
                            textTransform: 'capitalize',
                            transition: 'all 0.3s'
                        }}
                    >
                        {status} ({messages.filter(m => status === 'all' ? true : m.status === status).length})
                    </button>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 1.5fr' : '1fr', gap: '24px' }}>
                {/* Messages List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredMessages.map(msg => (
                        <div
                            key={msg._id}
                            onClick={() => viewMessage(msg._id)}
                            style={{
                                padding: '16px',
                                backgroundColor: 'white',
                                borderRadius: '12px',
                                border: `2px solid ${selectedMessage?._id === msg._id ? '#3b82f6' : '#e5e7eb'}`,
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: msg.status === 'unread' ? '0 2px 8px rgba(239, 68, 68, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {msg.status === 'unread' && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#ef4444'
                                        }}></div>
                                    )}
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1a202c' }}>
                                        {msg.name}
                                    </h3>
                                </div>
                                <span style={getStatusBadge(msg.status)}>{msg.status}</span>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                                {msg.subject}
                            </p>
                            <p style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {msg.message}
                            </p>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                                {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Message Detail */}
                {selectedMessage && (
                    <div style={{
                        padding: '24px',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
                                {selectedMessage.subject}
                            </h2>
                            <span style={getStatusBadge(selectedMessage.status)}>
                                {selectedMessage.status}
                            </span>
                        </div>

                        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #e5e7eb' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#374151' }}>From:</strong> {selectedMessage.name}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#374151' }}>Email:</strong> {selectedMessage.email}
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <strong style={{ color: '#374151' }}>Category:</strong> {selectedMessage.category}
                            </div>
                            <div>
                                <strong style={{ color: '#374151' }}>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <strong style={{ color: '#374151', display: 'block', marginBottom: '8px' }}>Message:</strong>
                            <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {selectedMessage.message}
                            </p>
                        </div>

                        <button
                            onClick={() => setSelectedMessage(null)}
                            style={{
                                marginTop: '24px',
                                padding: '10px 20px',
                                backgroundColor: '#f3f4f6',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151'
                            }}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ContactMessages;
