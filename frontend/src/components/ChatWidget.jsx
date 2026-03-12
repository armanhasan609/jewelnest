import { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { ShopContext } from '../context/ShopContext';
import { MessageCircle, X, Send, Sparkles, Trash2 } from 'lucide-react';
import axios from 'axios';

const ChatWidget = () => {
    const { token, userId, backendUrl, user } = useContext(ShopContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Connect socket
    useEffect(() => {
        if (!token || !userId) return;

        const newSocket = io(backendUrl, {
            transports: ['websocket'],
            secure: true
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            newSocket.emit('join_chat', userId);
        });

        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => {
                // Avoid duplicates
                const last = prev[prev.length - 1];
                if (last && last.text === message.text && last.sender === message.sender &&
                    Math.abs(new Date(last.timestamp) - new Date(message.timestamp)) < 2000) {
                    return prev;
                }
                return [...prev, message];
            });
        });

        newSocket.on('chat_cleared', (clearedUserId) => {
            if (clearedUserId === userId) {
                setMessages([]);
            }
        });

        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [token, userId, backendUrl]);

    // Load chat history when opened
    useEffect(() => {
        if (isOpen && token && userId) {
            setIsLoading(true);
            axios.get(`${backendUrl}/api/chat/${userId}`, {
                headers: { token }
            })
                .then((res) => {
                    if (res.data.success && res.data.messages) {
                        setMessages(res.data.messages);
                    }
                })
                .catch((err) => console.error('Failed to load chat history:', err))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, token, userId, backendUrl]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const sendMessage = () => {
        const text = input.trim();
        if (!text || !socket || !userId) return;

        socket.emit('send_message', {
            userId,
            sender: 'user',
            text
        });

        setInput('');
    };

    const confirmClearChat = async () => {
        try {
            const res = await axios.delete(`${backendUrl}/api/chat/${userId}`, {
                headers: { token }
            });
            if (res.data.success) {
                setMessages([]);
                if (socket) socket.emit('clear_chat', userId);
                setShowClearConfirm(false);
            }
        } catch (error) {
            console.error('Failed to clear chat:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (ts) => {
        const d = new Date(ts);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!token || !userId) return null;

    return (
        <>
            {/* Chat Bubble */}
            {!isOpen && (
                <button
                    id="chat-widget-bubble"
                    onClick={() => setIsOpen(true)}
                    style={{
                        position: 'fixed',
                        bottom: '28px',
                        right: '28px',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.45), 0 0 0 4px rgba(245, 158, 11, 0.15)',
                        zIndex: 9999,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: 'chatBubblePulse 2s infinite'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.55), 0 0 0 6px rgba(245, 158, 11, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(245, 158, 11, 0.45), 0 0 0 4px rgba(245, 158, 11, 0.15)';
                    }}
                >
                    <MessageCircle size={26} color="#fff" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div
                    id="chat-widget-window"
                    style={{
                        position: 'fixed',
                        bottom: '28px',
                        right: '28px',
                        width: '380px',
                        maxWidth: 'calc(100vw - 32px)',
                        height: '520px',
                        maxHeight: 'calc(100vh - 60px)',
                        borderRadius: '20px',
                        background: '#fff',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        zIndex: 9999,
                        animation: 'chatSlideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={20} color="#1e293b" />
                            </div>
                            <div>
                                <div style={{
                                    color: '#fff',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    letterSpacing: '0.3px'
                                }}>JewelNest Support</div>
                                <div style={{
                                    color: isConnected ? '#4ade80' : '#94a3b8',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: isConnected ? '#4ade80' : '#94a3b8',
                                        display: 'inline-block'
                                    }}></span>
                                    {isConnected ? 'Online' : 'Connecting...'}
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={() => setShowClearConfirm(true)}
                                title="Clear Chat"
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#fca5a5',
                                    borderRadius: '10px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.color = '#ef4444';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = '#fca5a5';
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    borderRadius: '10px',
                                    width: '36px',
                                    height: '36px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                    e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = '#94a3b8';
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Clear Confirmation Overlay */}
                    {showClearConfirm && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(4px)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 10,
                            padding: '30px',
                            textAlign: 'center',
                            animation: 'chatMsgFadeIn 0.2s ease-out'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px'
                            }}>
                                <Trash2 size={24} />
                            </div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>Clear Conversation?</h3>
                            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                                This will permanently delete your chat history. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <button
                                    onClick={() => setShowClearConfirm(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#f1f5f9',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#475569',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                                    onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmClearChat}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                                >
                                    Clear Chat
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        background: '#f8fafc'
                    }}>
                        {isLoading && (
                            <div style={{
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: '13px',
                                padding: '20px 0'
                            }}>Loading messages...</div>
                        )}

                        {!isLoading && messages.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: '#94a3b8'
                            }}>
                                <Sparkles size={36} style={{ color: '#fbbf24', marginBottom: '12px' }} />
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                                    Welcome, {user?.name || 'there'}!
                                </div>
                                <div style={{ fontSize: '13px' }}>
                                    Send us a message and we'll get back to you shortly.
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    animation: 'chatMsgFadeIn 0.25s ease-out'
                                }}
                            >
                                <div style={{
                                    maxWidth: '78%',
                                    padding: '10px 14px',
                                    borderRadius: msg.sender === 'user'
                                        ? '16px 16px 4px 16px'
                                        : '16px 16px 16px 4px',
                                    background: msg.sender === 'user'
                                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                        : '#fff',
                                    color: msg.sender === 'user' ? '#fff' : '#1e293b',
                                    fontSize: '13.5px',
                                    lineHeight: '1.5',
                                    boxShadow: msg.sender === 'user'
                                        ? '0 2px 12px rgba(245, 158, 11, 0.3)'
                                        : '0 2px 8px rgba(0,0,0,0.06)',
                                    wordBreak: 'break-word'
                                }}>
                                    <div>{msg.text}</div>
                                    <div style={{
                                        fontSize: '10px',
                                        opacity: 0.7,
                                        marginTop: '4px',
                                        textAlign: 'right'
                                    }}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #e2e8f0',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        flexShrink: 0
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: '1.5px solid #e2e8f0',
                                outline: 'none',
                                fontSize: '13.5px',
                                background: '#f8fafc',
                                transition: 'border-color 0.2s ease',
                                color: '#1e293b'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                border: 'none',
                                background: input.trim()
                                    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                                    : '#e2e8f0',
                                cursor: input.trim() ? 'pointer' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                flexShrink: 0
                            }}
                        >
                            <Send size={16} color={input.trim() ? '#fff' : '#94a3b8'} />
                        </button>
                    </div>
                </div>
            )}

            {/* Animations */}
            <style>{`
                @keyframes chatBubblePulse {
                    0%, 100% { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.45), 0 0 0 4px rgba(245, 158, 11, 0.15); }
                    50% { box-shadow: 0 8px 32px rgba(245, 158, 11, 0.55), 0 0 0 8px rgba(245, 158, 11, 0.08); }
                }
                @keyframes chatSlideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes chatMsgFadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Mobile Responsive Styles */}
            <style>{`
                @media (max-width: 640px) {
                    #chat-widget-bubble {
                        bottom: 16px !important;
                        right: 16px !important;
                        width: 50px !important;
                        height: 50px !important;
                    }
                    #chat-widget-window {
                        bottom: 0 !important;
                        right: 0 !important;
                        width: 100vw !important;
                        height: 100dvh !important;
                        max-width: 100vw !important;
                        max-height: 100dvh !important;
                        border-radius: 0 !important;
                        animation: chatSlideUpMobile 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
                    }
                }
                @keyframes chatSlideUpMobile {
                    from { opacity: 0; transform: translateY(100%); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default ChatWidget;
