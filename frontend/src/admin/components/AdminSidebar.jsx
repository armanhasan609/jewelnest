import { LayoutDashboard, PlusCircle, ShoppingBag, LogOut, Settings, Users, MessageSquare, Package, TrendingUp, Shield, Gem, Crown, Zap, Sparkles, Menu, X, Ticket } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const AdminSidebar = () => {
    const navigate = useNavigate();
    const [hoveredItem, setHoveredItem] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [sparklePositions, setSparklePositions] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const sidebarRef = useRef(null);

    // Check mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth <= 768) {
                setSidebarCollapsed(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Generate random sparkle positions
    useEffect(() => {
        const positions = Array.from({ length: 10 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.3,
            duration: Math.random() * 2 + 1
        }));
        setSparklePositions(positions);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                if (isMobile && mobileMenuOpen) {
                    setMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, mobileMenuOpen]);

    const handleExit = () => {
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
            sidebar.style.transform = 'translateX(-100%)';
            sidebar.style.opacity = '0';
        }

        setTimeout(() => {
            navigate('/');
        }, 300);
    };

    const handleMouseEnter = (itemName) => {
        setHoveredItem(itemName);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    const handleNavClick = () => {
        if (isMobile) {
            setMobileMenuOpen(false);
        }
    };

    const navItems = [
        { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "#3b82f6" },
        { path: "/admin/add-product", icon: PlusCircle, label: "Add Product", color: "#10b981" },
        { path: "/admin/add-coupon", icon: Ticket, label: "Add Coupon", color: "#6366f1" },
        { path: "/admin/orders", icon: ShoppingBag, label: "Orders", color: "#f59e0b" },
        { path: "/admin/inquiries", icon: MessageSquare, label: "Inquiries", color: "#ec4899" },
        { path: "/admin/users", icon: Users, label: "Users", color: "#ef4444" },
    ];

    // Get admin info
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const adminName = parsedUser?.name || localStorage.getItem('adminName') || 'Admin';
    const adminEmail = parsedUser?.email || localStorage.getItem('adminEmail') || 'admin@jewelnest.com';
    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';

    // Responsive sidebar width
    const getSidebarWidth = () => {
        if (isMobile) {
            return mobileMenuOpen ? '280px' : '0px';
        }
        return sidebarCollapsed ? '80px' : '320px';
    };

    const sidebarStyle = {
        width: getSidebarWidth(),
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        top: '0',
        left: '0',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '4px 0 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        zIndex: '1000',
        overflow: 'hidden',
    };

    const logoSectionStyle = {
        padding: isMobile ? '16px 20px' : (sidebarCollapsed ? '20px 12px' : '24px'),
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        height: isMobile ? '80px' : 'auto'
    };

    const logoTitleStyle = {
        fontSize: isMobile ? '24px' : (sidebarCollapsed ? '18px' : '28px'),
        fontWeight: '800',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
        letterSpacing: '0.5px',
        fontFamily: "'Playfair Display', serif",
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        transition: 'all 0.3s ease',
        lineHeight: '1.2'
    };

    const logoSubtitleStyle = {
        fontSize: '10px',
        color: '#94a3b8',
        fontWeight: '600',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        opacity: isMobile ? '1' : (sidebarCollapsed ? '0' : '1'),
        transition: 'all 0.3s ease',
        transform: isMobile ? 'translateX(0)' : (sidebarCollapsed ? 'translateX(-20px)' : 'translateX(0)'),
        marginTop: '4px',
        marginBottom: 0
    };

    const navContainerStyle = {
        padding: isMobile ? '12px 16px' : '12px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        scrollbarWidth: 'none', // Firefox - hide scrollbar
        msOverflowStyle: 'none', // IE and Edge - hide scrollbar
    };

    const linkBaseStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : (sidebarCollapsed ? '0' : '12px'),
        padding: isMobile ? '12px 16px' : (sidebarCollapsed ? '12px 8px' : '12px 16px'),
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '14px',
        fontWeight: '500',
        color: '#cbd5e1',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(10px)',
        justifyContent: isMobile ? 'flex-start' : (sidebarCollapsed ? 'center' : 'flex-start'),
        minHeight: '44px',
        flexShrink: 0
    };

    const adminInfoStyle = {
        padding: isMobile ? '16px' : (sidebarCollapsed ? '12px 8px' : '16px 20px'),
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
        flexShrink: 0
    };

    const adminAvatarStyle = {
        width: isMobile ? '40px' : (sidebarCollapsed ? '36px' : '40px'),
        height: isMobile ? '40px' : (sidebarCollapsed ? '36px' : '40px'),
        borderRadius: '10px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1e293b',
        fontWeight: '700',
        fontSize: isMobile ? '18px' : '16px',
        flexShrink: '0',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
    };

    const adminDetailsStyle = {
        flex: '1',
        overflow: 'hidden',
        opacity: isMobile ? '1' : (sidebarCollapsed ? '0' : '1'),
        transform: isMobile ? 'translateX(0)' : (sidebarCollapsed ? 'translateX(-20px)' : 'translateX(0)'),
        transition: 'all 0.3s ease'
    };

    const adminNameStyle = {
        fontSize: '14px',
        fontWeight: '600',
        color: 'white',
        marginBottom: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const adminRoleStyle = {
        fontSize: '11px',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap'
    };

    const roleBadgeStyle = {
        backgroundColor: isSuperAdmin ? '#f59e0b' : '#8b5cf6',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '9px',
        fontWeight: '700',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        flexShrink: '0'
    };

    const logoutButtonStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '12px' : (sidebarCollapsed ? '0' : '12px'),
        padding: isMobile ? '14px 20px' : (sidebarCollapsed ? '12px 8px' : '14px 20px'),
        margin: isMobile ? '12px 16px 20px 16px' : '12px 12px 20px 12px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        color: '#fca5a5',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        justifyContent: isMobile ? 'flex-start' : (sidebarCollapsed ? 'center' : 'flex-start'),
        position: 'relative',
        overflow: 'hidden',
        minHeight: '44px',
        flexShrink: 0
    };

    const toggleButtonStyle = {
        position: 'absolute',
        top: isMobile ? '16px' : '24px',
        right: isMobile ? '16px' : '-16px',
        width: isMobile ? '36px' : '28px',
        height: isMobile ? '36px' : '28px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: 'none',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)',
        zIndex: '1001'
    };

    const mobileOverlayStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: '999',
        display: mobileMenuOpen ? 'block' : 'none',
        opacity: mobileMenuOpen ? 1 : 0,
        transition: 'opacity 0.3s ease'
    };

    const mobileMenuButtonStyle = {
        position: 'fixed',
        top: '16px',
        left: '16px',
        width: '44px',
        height: '44px',
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        border: 'none',
        borderRadius: '10px',
        display: isMobile ? 'flex' : 'none',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: '998',
        boxShadow: '0 4px 20px rgba(251, 191, 36, 0.4)'
    };

    return (
        <>
            {/* Mobile Menu Button */}
            {isMobile && (
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={mobileMenuButtonStyle}
                >
                    {mobileMenuOpen ? <X size={22} color="#1e293b" /> : <Menu size={22} color="#1e293b" />}
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && (
                <div
                    style={mobileOverlayStyle}
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <div
                className="admin-sidebar"
                style={sidebarStyle}
                ref={sidebarRef}
            >
                {/* Animated Background Elements */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    background: 'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.05) 0%, transparent 50%)',
                    pointerEvents: 'none'
                }}></div>

                {/* Sparkle Particles */}
                {sparklePositions.map((sparkle, index) => (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${sparkle.x}%`,
                            top: `${sparkle.y}%`,
                            width: `${sparkle.size}px`,
                            height: `${sparkle.size}px`,
                            backgroundColor: '#fbbf24',
                            borderRadius: '50%',
                            opacity: sparkle.opacity,
                            animation: `sparkle ${sparkle.duration}s infinite alternate`,
                            pointerEvents: 'none'
                        }}
                    />
                ))}

                {/* Logo Section */}
                <div style={logoSectionStyle}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        justifyContent: isMobile ? 'flex-start' : (sidebarCollapsed ? 'center' : 'flex-start'),
                        width: '100%'
                    }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
                            animation: 'float 3s ease-in-out infinite',
                            flexShrink: 0
                        }}>
                            <Gem size={isMobile ? 24 : (sidebarCollapsed ? 20 : 24)} color="#1e293b" />
                        </div>
                        <div style={{
                            overflow: 'hidden',
                            flex: 1,
                            minWidth: 0
                        }}>
                            <h2 style={logoTitleStyle}>
                                {isMobile ? 'JewelNest' : (sidebarCollapsed ? 'JN' : 'JewelNest')}
                            </h2>
                            <p style={logoSubtitleStyle}>ADMIN PANEL</p>
                        </div>
                    </div>
                    {isSuperAdmin && (isMobile || !sidebarCollapsed) && (
                        <div style={{
                            position: 'absolute',
                            top: isMobile ? '16px' : '20px',
                            right: isMobile ? '16px' : '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            borderRadius: '8px',
                            fontSize: '10px',
                            color: '#f59e0b',
                            fontWeight: '600',
                            border: '1px solid rgba(245, 158, 11, 0.3)'
                        }}>
                            <Crown size={10} /> SUPER ADMIN
                        </div>
                    )}
                </div>

                {/* Toggle Button (Desktop only) */}
                {!isMobile && (
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={toggleButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(-2px) scale(1.1)';
                            e.currentTarget.style.boxShadow = '0 6px 24px rgba(251, 191, 36, 0.6)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(251, 191, 36, 0.4)';
                        }}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#1e293b"
                            strokeWidth="3"
                            style={{
                                transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                            }}
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                )}

                {/* Navigation Menu - Scrollable Container */}
                <div style={navContainerStyle}>
                    <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginBottom: '16px',
                        paddingLeft: isMobile ? '16px' : (sidebarCollapsed ? '8px' : '16px'),
                        opacity: isMobile ? '1' : (sidebarCollapsed ? '0' : '1'),
                        transform: isMobile ? 'translateX(0)' : (sidebarCollapsed ? 'translateX(-20px)' : 'translateX(0)'),
                        transition: 'all 0.3s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                    }}>
                        Navigation
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        paddingRight: '4px',
                        marginRight: '-4px',
                        scrollbarWidth: 'none', // Firefox
                        msOverflowStyle: 'none', // IE/Edge
                    }}>
                        {navItems.map((item, index) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                style={({ isActive }) => ({
                                    ...linkBaseStyle,
                                    backgroundColor: isActive ? `rgba(${parseInt(item.color.slice(1, 3), 16)}, ${parseInt(item.color.slice(3, 5), 16)}, ${parseInt(item.color.slice(5, 7), 16)}, 0.2)` : 'transparent',
                                    color: isActive ? item.color : hoveredItem === item.label ? 'white' : '#cbd5e1',
                                    borderLeft: isActive ? `4px solid ${item.color}` : 'none',
                                    transform: isActive ? 'translateX(8px)' : hoveredItem === item.label ? 'translateX(8px)' : 'translateX(0)',
                                    boxShadow: isActive ? `0 8px 32px ${item.color}40` : 'none',
                                    animationDelay: `${index * 0.05}s`
                                })}
                                onMouseEnter={() => handleMouseEnter(item.label)}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => {
                                    setActiveItem(item.label);
                                    handleNavClick();
                                }}
                            >
                                <div style={{
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    flexShrink: 0
                                }}>
                                    <item.icon
                                        size={isMobile ? 20 : 18}
                                        style={{
                                            color: 'inherit',
                                            transition: 'all 0.3s ease',
                                            transform: hoveredItem === item.label ? 'scale(1.2) rotate(5deg)' : 'scale(1)'
                                        }}
                                    />
                                    {hoveredItem === item.label && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: item.color,
                                            borderRadius: '50%',
                                            animation: 'pulse 2s infinite'
                                        }}></div>
                                    )}
                                </div>
                                <span style={{
                                    transition: 'all 0.3s ease',
                                    opacity: isMobile ? '1' : (sidebarCollapsed ? '0' : '1'),
                                    transform: isMobile ? 'translateX(0)' : (sidebarCollapsed ? 'translateX(-20px)' : 'translateX(0)'),
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    flex: 1
                                }}>
                                    {item.label}
                                </span>

                                {/* Active indicator glow */}
                                {activeItem === item.label && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '0',
                                        left: '0',
                                        right: '0',
                                        bottom: '0',
                                        background: `radial-gradient(circle at center, ${item.color}20 0%, transparent 70%)`,
                                        pointerEvents: 'none'
                                    }}></div>
                                )}
                            </NavLink>
                        ))}
                    </div>

                    {/* Quick Stats section removed */}
                </div>

                {/* Admin Info */}
                <div style={adminInfoStyle}>
                    <div style={adminAvatarStyle}>
                        <span style={{
                            animation: 'bounce 2s infinite'
                        }}>
                            {adminName.charAt(0).toUpperCase()}
                        </span>
                        {isSuperAdmin && (
                            <div style={{
                                position: 'absolute',
                                bottom: '-3px',
                                right: '-3px',
                                background: '#f59e0b',
                                borderRadius: '50%',
                                padding: '3px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #1e293b'
                            }}>
                                <Crown size={10} color="#1e293b" />
                            </div>
                        )}
                    </div>
                    <div style={adminDetailsStyle}>
                        <div style={adminNameStyle}>{adminName}</div>
                        <div style={adminRoleStyle}>
                            <span style={{
                                fontSize: '11px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1,
                                minWidth: 0
                            }}>
                                {adminEmail}
                            </span>
                            <span style={roleBadgeStyle}>
                                {isSuperAdmin ? 'SUPER' : 'ADMIN'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Exit Panel Button */}
                <button
                    onClick={handleExit}
                    style={logoutButtonStyle}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(239, 68, 68, 0.2) 100%)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.3)';
                        e.currentTarget.children[0].style.transform = 'scale(1.2) rotate(10deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.children[0].style.transform = 'scale(1) rotate(0)';
                    }}
                >
                    <LogOut
                        size={isMobile ? 20 : 18}
                        style={{
                            transition: 'all 0.3s ease',
                            flexShrink: '0'
                        }}
                    />
                    <span style={{
                        transition: 'all 0.3s ease',
                        opacity: isMobile ? '1' : (sidebarCollapsed ? '0' : '1'),
                        transform: isMobile ? 'translateX(0)' : (sidebarCollapsed ? 'translateX(-20px)' : 'translateX(0)'),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        flex: 1
                    }}>
                        Exit Panel
                    </span>

                    {/* Hover effect */}
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, transparent 50%)',
                        opacity: '0',
                        transition: 'opacity 0.3s ease'
                    }}></div>
                </button>

                {/* Enhanced CSS Animations */}
                <style>{`
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }

                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-8px); }
                    }

                    @keyframes pulse {
                        0%, 100% { 
                            transform: scale(1);
                            opacity: 0.8;
                        }
                        50% { 
                            transform: scale(1.3);
                            opacity: 0.4;
                        }
                    }

                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                    }

                    @keyframes sparkle {
                        0% { opacity: 0.3; transform: scale(1); }
                        100% { opacity: 0.8; transform: scale(1.3); }
                    }

                    .admin-sidebar * {
                        animation-fill-mode: both;
                    }

                    /* Completely hide scrollbar but keep scrolling functionality */
                    .admin-sidebar ::-webkit-scrollbar {
                        width: 0;
                        background: transparent;
                        display: none;
                    }

                    .admin-sidebar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }

                    /* Hide scrollbar for the nav container specifically */
                    .admin-sidebar > div:nth-child(3) {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .admin-sidebar > div:nth-child(3)::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                    }

                    .admin-sidebar > div:nth-child(3) > div:last-child {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .admin-sidebar > div:nth-child(3) > div:last-child::-webkit-scrollbar {
                        display: none;
                        width: 0;
                        height: 0;
                    }

                    /* Responsive styles */
                    @media (max-width: 768px) {
                        .admin-sidebar {
                            box-shadow: 4px 0 40px rgba(0, 0, 0, 0.4);
                        }
                    }

                    /* Glass morphism effect */
                    .admin-sidebar::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
                        backdrop-filter: blur(20px);
                        z-index: -1;
                    }

                    /* Smooth transitions */
                    * {
                        transition: all 0.3s ease;
                    }
                `}</style>
            </div>

            {/* Content padding for mobile */}
            <div style={{
                marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : '320px'),
                transition: 'margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                paddingTop: isMobile ? '76px' : '0',
                minHeight: '100vh',
                overflowX: 'hidden'
            }}>
                {/* Your main content will go here */}
            </div>
        </>
    );
};

export default AdminSidebar;