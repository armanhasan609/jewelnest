import { useState, useEffect, useRef, useContext } from 'react';
import { io } from 'socket.io-client';
import { ShopContext } from '../../context/ShopContext';
import { MessageCircle, Send, Search, ArrowLeft, Sparkles, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const AdminChat = () => {
    const { token, backendUrl } = useContext(ShopContext);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoadingChats, setIsLoadingChats] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Responsive
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Connect socket
    useEffect(() => {
        if (!token) return;
        const newSocket = io(backendUrl, { transports: ['websocket', 'polling'] });

        newSocket.on('connect', () => setIsConnected(true));
        newSocket.on('disconnect', () => setIsConnected(false));

        newSocket.on('receive_message', (message) => {
            setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last && last.text === message.text && last.sender === message.sender &&
                    Math.abs(new Date(last.timestamp) - new Date(message.timestamp)) < 2000) {
                    return prev;
                }
                return [...prev, message];
            });

            // Update chat list preview
            setChats((prev) => prev.map((c) => {
                if (c.userId === selectedChat?.userId) {
                    return { ...c, lastMessage: message.text, lastSender: message.sender, lastMessageAt: message.timestamp };
                }
                return c;
            }));
        });

        newSocket.on('chat_cleared', (clearedUserId) => {
             // If we receive this, clear the UI messages
             setMessages([]);
             
             // Safely update the chats list using functional state update
             setChats(prev => prev.filter(c => c.userId !== clearedUserId));
             
             // Safely clear the selected chat if it was the one cleared
             setSelectedChat(current => {
                 if (current && current.userId === clearedUserId) {
                     return null;
                 }
                 return current;
             });
        });

        setSocket(newSocket);
        return () => newSocket.disconnect();
    }, [token, backendUrl]);

    // Load all chats
    useEffect(() => {
        if (!token) return;
        setIsLoadingChats(true);
        axios.get(`${backendUrl}/api/chat/admin/all`, { headers: { token } })
            .then((res) => {
                if (res.data.success) setChats(res.data.chats);
            })
            .catch((err) => console.error('Failed to load chats:', err))
            .finally(() => setIsLoadingChats(false));
    }, [token, backendUrl]);

    // Load messages for selected chat
    useEffect(() => {
        if (!selectedChat || !token) return;
        setIsLoadingMessages(true);
        axios.get(`${backendUrl}/api/chat/${selectedChat.userId}`, { headers: { token } })
            .then((res) => {
                if (res.data.success) setMessages(res.data.messages);
            })
            .catch((err) => console.error('Failed to load messages:', err))
            .finally(() => setIsLoadingMessages(false));

        // Join room
        if (socket) socket.emit('join_chat', selectedChat.userId);
        setTimeout(() => inputRef.current?.focus(), 200);
    }, [selectedChat, token, backendUrl]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        const text = input.trim();
        if (!text || !socket || !selectedChat) return;
        socket.emit('send_message', { userId: selectedChat.userId, sender: 'admin', text });
        // After admin sends a message, if the chat wasn't active, it exists now. We shouldn't need to do anything explicit here as the receive_message event will handle it.
        setInput('');
    };

    const clearChat = async () => {
        if (!selectedChat) return;
        if (!window.confirm(`Are you sure you want to clear the chat with ${selectedChat.userName}?`)) return;

        try {
            const res = await axios.delete(`${backendUrl}/api/chat/${selectedChat.userId}`, { headers: { token } });
            if (res.data.success) {
                setMessages([]);
                // Remove from the list and deselect completely
                setChats(prev => prev.filter(c => c.userId !== selectedChat.userId));
                if (socket) socket.emit('clear_chat', selectedChat.userId);
                setSelectedChat(null);
            }
        } catch (error) {
            console.error('Failed to clear chat:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const diffDays = Math.floor((now - d) / 86400000);
        if (diffDays === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (diffDays === 1) return 'Yesterday';
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filteredChats = chats.filter((c) =>
        c.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.userEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showChatList = !isMobile || !selectedChat;
    const showConversation = !isMobile || selectedChat;

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            background: '#f1f5f9',
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>

            {/* Chat List Panel */}
            {showChatList && (
                <div style={{
                    width: isMobile ? '100%' : '360px',
                    minWidth: isMobile ? '100%' : '320px',
                    background: '#fff',
                    borderRight: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    flexShrink: 0
                }}>
                    {/* List Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #e2e8f0',
                        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                        flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <MessageCircle size={22} color="#fbbf24" />
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#fff' }}>Live Chat</h2>
                            <span style={{
                                marginLeft: 'auto',
                                fontSize: '11px',
                                padding: '3px 10px',
                                borderRadius: '20px',
                                background: isConnected ? 'rgba(74, 222, 128, 0.2)' : 'rgba(148, 163, 184, 0.2)',
                                color: isConnected ? '#4ade80' : '#94a3b8',
                                fontWeight: '600'
                            }}>
                                {isConnected ? '● Live' : '○ Offline'}
                            </span>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 38px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.08)',
                                    color: '#fff',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>
                    </div>

                    {/* Chat Items */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {isLoadingChats && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                                Loading conversations...
                            </div>
                        )}
                        {!isLoadingChats && filteredChats.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <div style={{ fontSize: '14px' }}>No conversations yet</div>
                            </div>
                        )}
                        {filteredChats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '14px 20px',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: selectedChat?._id === chat._id ? '#fef9ee' : '#fff',
                                    borderLeft: selectedChat?._id === chat._id ? '3px solid #f59e0b' : '3px solid transparent',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedChat?._id !== chat._id) e.currentTarget.style.background = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedChat?._id !== chat._id) e.currentTarget.style.background = '#fff';
                                }}
                            >
                                <div style={{
                                    width: '42px',
                                    height: '42px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1e293b',
                                    fontWeight: '700',
                                    fontSize: '16px',
                                    flexShrink: 0
                                }}>
                                    {chat.userName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                                            {chat.userName}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                                            {formatTime(chat.lastMessageAt)}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '12.5px',
                                        color: '#64748b',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {chat.lastSender === 'admin' ? 'You: ' : ''}{chat.lastMessage || 'No messages'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Conversation Panel */}
            {showConversation && (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    minWidth: 0
                }}>
                    {selectedChat ? (
                        <>
                            {/* Conversation Header */}
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                flexShrink: 0,
                                background: '#fff'
                            }}>
                                {isMobile && (
                                    <button
                                        onClick={() => setSelectedChat(null)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '6px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            color: '#64748b'
                                        }}
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <div style={{
                                    width: '38px',
                                    height: '38px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1e293b',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    flexShrink: 0
                                }}>
                                    {selectedChat.userName?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '15px', color: '#1e293b' }}>
                                        {selectedChat.userName}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {selectedChat.userEmail}
                                    </div>
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                    <button
                                        onClick={clearChat}
                                        title="Clear Chat"
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#ef4444',
                                            borderRadius: '10px',
                                            padding: '8px 12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        }}
                                    >
                                        <Trash2 size={16} />
                                        <span>Clear</span>
                                    </button>
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                                background: '#f8fafc'
                            }}>
                                {isLoadingMessages && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '13px' }}>
                                        Loading messages...
                                    </div>
                                )}
                                {!isLoadingMessages && messages.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <MessageCircle size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                                        <div style={{ fontSize: '14px' }}>No messages in this conversation</div>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            justifyContent: msg.sender === 'admin' ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '10px 14px',
                                            borderRadius: msg.sender === 'admin'
                                                ? '16px 16px 4px 16px'
                                                : '16px 16px 16px 4px',
                                            background: msg.sender === 'admin'
                                                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                                : '#fff',
                                            color: msg.sender === 'admin' ? '#fff' : '#1e293b',
                                            fontSize: '13.5px',
                                            lineHeight: '1.5',
                                            boxShadow: msg.sender === 'admin'
                                                ? '0 2px 12px rgba(59, 130, 246, 0.3)'
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

                            {/* Admin Input */}
                            <div style={{
                                padding: '14px 20px',
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: '#fff',
                                flexShrink: 0
                            }}>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type a reply..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    style={{
                                        flex: 1,
                                        padding: '11px 16px',
                                        borderRadius: '12px',
                                        border: '1.5px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '14px',
                                        background: '#f8fafc',
                                        transition: 'border-color 0.2s ease',
                                        color: '#1e293b'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!input.trim()}
                                    style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: input.trim()
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                                            : '#e2e8f0',
                                        cursor: input.trim() ? 'pointer' : 'default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s ease',
                                        flexShrink: 0
                                    }}
                                >
                                    <Send size={17} color={input.trim() ? '#fff' : '#94a3b8'} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            gap: '12px'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '8px'
                            }}>
                                <Sparkles size={36} color="#1e293b" />
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#475569' }}>
                                Select a conversation
                            </div>
                            <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                                Choose a user from the list to start chatting
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminChat;
