import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, User, Menu, Search, LogOut, Flame, ChevronDown } from "lucide-react";
import { useContext, useState, useEffect, useRef } from "react";
import { ShopContext } from "../context/ShopContext";
import logo from "../assets/logo.png";

const Navbar = () => {
    const { getCartCount, token, role, logout, setSearch, setShowSearch } =
        useContext(ShopContext);

    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show background when scrolled > 20
            setIsScrolled(currentScrollY > 20);

            // Auto-hide logic: 
            // Hide when scrolling down (current > last) and passed a threshold (100)
            // Show when scrolling up (current < last)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
                setIsProfileDropdownOpen(false); // Close dropdown if it was open
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        if (!searchQuery.trim()) return;
        setSearch(searchQuery);
        setShowSearch(true);
        navigate("/collection");
        setSearchQuery("");
        setIsMobileMenuOpen(false);
        if (searchInputRef.current) searchInputRef.current.blur();
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSearch();
        }
    };

    const handleLogout = () => {
        logout();
        setIsProfileDropdownOpen(false);
        setIsMobileMenuOpen(false);
        navigate("/");
    };

    const navStyle = {
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        zIndex: "1000",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        background: isScrolled
            ? "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)"
            : "#ffffff",
        backdropFilter: isScrolled ? "blur(20px)" : "none",
        borderBottom: isScrolled
            ? "1px solid rgba(184, 134, 11, 0.1)"
            : "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: isScrolled
            ? "0 10px 40px rgba(0, 0, 0, 0.08)"
            : "none",
        padding: isScrolled ? "12px 5%" : "18px 5%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    };

    const mobileMenuButtonStyle = {
        display: "none",
        flexDirection: "column",
        gap: "6px",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "10px",
        borderRadius: "10px",
        transition: "all 0.3s ease",
    };

    const mobileMenuStyle = {
        position: "fixed",
        top: "80px",
        left: "0",
        right: "0",
        background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)",
        backdropFilter: "blur(20px)",
        padding: "28px 5%",
        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
        zIndex: "999",
        transform: isMobileMenuOpen ? "translateY(0)" : "translateY(-20px)",
        opacity: isMobileMenuOpen ? "1" : "0",
        visibility: isMobileMenuOpen ? "visible" : "hidden",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    };

    return (
        <>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                    
                    @keyframes bounce {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-3px); }
                    }
                    
                    @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                    
                    @keyframes shimmer {
                        0% { background-position: -200px 0; }
                        100% { background-position: 200px 0; }
                    }
                    
                    .hover-lift:hover {
                        transform: translateY(-3px);
                        transition: transform 0.3s ease;
                    }
                    
                    .hover-scale:hover {
                        transform: scale(1.05);
                        transition: transform 0.3s ease;
                    }
                    
                    .hover-glow:hover {
                        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.25);
                    }
                    
                    .nav-link {
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .nav-link::after {
                        content: '';
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        width: 0;
                        height: 2px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        transition: width 0.3s ease;
                    }
                    
                    .nav-link:hover::after,
                    .nav-link.active::after {
                        width: 100%;
                    }
                    
                    .sale-badge {
                        position: absolute;
                        top: -4px;
                        right: -4px;
                        width: 8px;
                        height: 8px;
                        background: #ffd700;
                        border-radius: 50%;
                        animation: pulse 1.5s infinite;
                    }
                    
                    .cart-badge {
                        animation: bounce 2s infinite;
                    }
                    
                    @media (max-width: 1024px) {
                        .desktop-only {
                            display: none !important;
                        }
                        
                        .mobile-menu-button {
                            display: flex !important;
                        }
                    }
                    
                    @media (max-width: 768px) {
                        nav {
                            padding: 12px 20px !important;
                        }
                        
                        .brand-text {
                            font-size: 18px !important;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        nav {
                            padding: 10px 16px !important;
                        }
                        
                        .brand-text {
                            font-size: 16px !important;
                        }
                    }
                `}
            </style>

            <nav style={navStyle}>
                {/* Logo */}
                <Link
                    to="/"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        textDecoration: "none",
                        transition: "transform 0.3s ease",
                    }}
                    className="hover-scale"
                >
                    <img
                        src={logo}
                        style={{
                            width: "44px",
                            height: "44px",
                            objectFit: "contain",
                            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15))",
                            transition: "transform 0.3s ease",
                        }}
                        alt="JEWELNEST Logo"
                        className="hover-scale"
                    />
                    <span style={{
                        fontSize: "22px",
                        fontWeight: "800",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        letterSpacing: "1.5px",
                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }} className="brand-text">
                        JEWELNEST
                    </span>
                </Link>

                {/* Desktop Navigation Links */}
                <div style={{
                    display: "flex",
                    gap: "32px",
                    alignItems: "center",
                }} className="desktop-only">
                    <Link
                        to="/"
                        style={{
                            position: "relative",
                            textDecoration: "none",
                            color: location.pathname === "/" ? "#2d3748" : "#4a5568",
                            fontSize: "15px",
                            fontWeight: location.pathname === "/" ? "600" : "500",
                            padding: "8px 0",
                            transition: "all 0.3s ease",
                        }}
                        className="nav-link"
                    >
                        Home
                    </Link>

                    <Link
                        to="/collection"
                        style={{
                            position: "relative",
                            textDecoration: "none",
                            color: location.pathname === "/collection" ? "#2d3748" : "#4a5568",
                            fontSize: "15px",
                            fontWeight: location.pathname === "/collection" ? "600" : "500",
                            padding: "8px 0",
                            transition: "all 0.3s ease",
                        }}
                        className="nav-link"
                    >
                        Collections
                    </Link>

                    {/* Today Sale Link */}
                    <Link
                        to="/today-sale"
                        style={{
                            position: "relative",
                            textDecoration: "none",
                            background: "linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)",
                            color: "white",
                            padding: "10px 22px",
                            borderRadius: "30px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 6px 20px rgba(255, 107, 107, 0.4)",
                            transition: "all 0.3s ease",
                        }}
                        className="hover-lift"
                    >
                        <Flame size={16} style={{ fill: "white" }} />
                        Today Sale
                        <span className="sale-badge" />
                    </Link>

                    {token && (
                        <Link
                            to="/orders"
                            style={{
                                position: "relative",
                                textDecoration: "none",
                                color: location.pathname === "/orders" ? "#2d3748" : "#4a5568",
                                fontSize: "15px",
                                fontWeight: location.pathname === "/orders" ? "600" : "500",
                                padding: "8px 0",
                                transition: "all 0.3s ease",
                            }}
                            className="nav-link"
                        >
                            My Orders
                        </Link>
                    )}

                    <Link
                        to="/contact"
                        style={{
                            position: "relative",
                            textDecoration: "none",
                            color: location.pathname === "/contact" ? "#2d3748" : "#4a5568",
                            fontSize: "15px",
                            fontWeight: location.pathname === "/contact" ? "600" : "500",
                            padding: "8px 0",
                            transition: "all 0.3s ease",
                        }}
                        className="nav-link"
                    >
                        Contact
                    </Link>

                    {token && role === "admin" && (
                        <Link
                            to="/admin/dashboard"
                            style={{
                                textDecoration: "none",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                padding: "10px 22px",
                                borderRadius: "30px",
                                fontWeight: "600",
                                marginLeft: "8px",
                                transition: "all 0.3s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                            className="hover-lift hover-glow"
                        >
                            <span style={{ fontSize: "14px" }}>👑</span>
                            Admin Panel
                        </Link>
                    )}
                </div>

                {/* Right Section */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                }}>
                    {/* Desktop Search */}
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            background: isSearchFocused
                                ? "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)"
                                : "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                            borderRadius: "30px",
                            padding: "10px 22px",
                            border: isSearchFocused
                                ? "2px solid rgba(102, 126, 234, 0.4)"
                                : "1px solid rgba(102, 126, 234, 0.15)",
                            transition: "all 0.3s ease",
                            boxShadow: isSearchFocused
                                ? "0 10px 30px rgba(102, 126, 234, 0.15)"
                                : "0 4px 12px rgba(0, 0, 0, 0.05)",
                        }}
                        className="desktop-only hover-glow"
                    >
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search jewelry..."
                            style={{
                                background: "transparent",
                                border: "none",
                                outline: "none",
                                fontSize: "14px",
                                fontWeight: "500",
                                color: "#2d3748",
                                width: isSearchFocused ? "220px" : "180px",
                                transition: "width 0.3s ease, padding 0.3s ease",
                                padding: "4px 8px",
                                marginRight: "8px",
                            }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        <Search
                            onClick={handleSearch}
                            size={18}
                            style={{
                                cursor: "pointer",
                                color: "#667eea",
                                transition: "transform 0.3s ease",
                            }}
                            className="hover-scale"
                        />
                    </div>

                    {/* User Profile / Login */}
                    {token ? (
                        <div ref={dropdownRef} style={{ position: "relative" }}>
                            <button
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    color: "white",
                                    border: "none",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                                }}
                                className="hover-lift hover-glow"
                                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                            >
                                <User size={18} />
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileDropdownOpen && (
                                <div style={{
                                    position: "absolute",
                                    top: "calc(100% + 12px)",
                                    right: "0",
                                    background: "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)",
                                    backdropFilter: "blur(20px)",
                                    borderRadius: "16px",
                                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 32px rgba(0, 0, 0, 0.1)",
                                    padding: "16px 0",
                                    minWidth: "200px",
                                    border: "1px solid rgba(255, 255, 255, 0.2)",
                                    animation: "float 0.3s ease",
                                }}>
                                    <div style={{
                                        padding: "0 20px 12px 20px",
                                        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                                        marginBottom: "8px",
                                    }}>
                                        <p style={{
                                            fontSize: "12px",
                                            color: "#94a3b8",
                                            fontWeight: "600",
                                            textTransform: "uppercase",
                                            letterSpacing: "1px",
                                        }}>
                                            Welcome Back
                                        </p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px 20px",
                                            color: "#4a5568",
                                            textDecoration: "none",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            transition: "all 0.2s ease",
                                        }}
                                        onClick={() => setIsProfileDropdownOpen(false)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(102, 126, 234, 0.1)";
                                            e.currentTarget.style.color = "#667eea";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                            e.currentTarget.style.color = "#4a5568";
                                        }}
                                    >
                                        <User size={16} />
                                        My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            padding: "12px 20px",
                                            color: "#ef4444",
                                            background: "none",
                                            border: "none",
                                            width: "100%",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontSize: "14px",
                                            fontWeight: "500",
                                            transition: "all 0.2s ease",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "44px",
                                height: "44px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                                color: "#4a5568",
                                textDecoration: "none",
                                border: "1px solid rgba(102, 126, 234, 0.15)",
                                transition: "all 0.3s ease",
                            }}
                            className="hover-lift hover-glow"
                        >
                            <User size={18} />
                        </Link>
                    )}

                    {/* Cart */}
                    <Link
                        to="/cart"
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                            color: "#4a5568",
                            textDecoration: "none",
                            border: "1px solid rgba(102, 126, 234, 0.15)",
                            transition: "all 0.3s ease",
                        }}
                        className="hover-lift hover-glow"
                    >
                        <ShoppingBag size={18} />
                        {getCartCount() > 0 && (
                            <span style={{
                                position: "absolute",
                                top: "-4px",
                                right: "-4px",
                                width: "22px",
                                height: "22px",
                                background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
                                color: "white",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: "700",
                                boxShadow: "0 4px 12px rgba(238, 90, 82, 0.4)",
                            }} className="cart-badge">
                                {getCartCount()}
                            </span>
                        )}
                    </Link>

                    {/* Mobile Menu Button */}
                    <button
                        style={{
                            ...mobileMenuButtonStyle,
                            background: isMobileMenuOpen
                                ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                : "linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)",
                        }}
                        className="mobile-menu-button hover-glow"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span style={{
                            width: "24px",
                            height: "2px",
                            background: isMobileMenuOpen ? "white" : "#4a5568",
                            transition: "all 0.3s ease",
                            transform: isMobileMenuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
                        }}></span>
                        <span style={{
                            width: "24px",
                            height: "2px",
                            background: isMobileMenuOpen ? "white" : "#4a5568",
                            transition: "all 0.3s ease",
                            opacity: isMobileMenuOpen ? "0" : "1",
                        }}></span>
                        <span style={{
                            width: "24px",
                            height: "2px",
                            background: isMobileMenuOpen ? "white" : "#4a5568",
                            transition: "all 0.3s ease",
                            transform: isMobileMenuOpen ? "rotate(-45deg) translate(7px, -6px)" : "none",
                        }}></span>
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div style={mobileMenuStyle}>
                {/* Mobile Search Bar */}
                <div style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                    borderRadius: "30px",
                    padding: "12px 24px",
                    border: "2px solid rgba(102, 126, 234, 0.2)",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                    marginBottom: "24px",
                }}>
                    <input
                        type="text"
                        placeholder="Search jewelry..."
                        style={{
                            background: "transparent",
                            border: "none",
                            outline: "none",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#2d3748",
                            width: "100%",
                            padding: "4px 12px",
                        }}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchKeyDown}
                    />
                    <Search
                        onClick={handleSearch}
                        size={20}
                        style={{
                            cursor: "pointer",
                            color: "#667eea",
                            flexShrink: "0",
                        }}
                    />
                </div>

                {/* Mobile Navigation Links */}
                <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}>
                    <Link
                        to="/"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 20px",
                            color: location.pathname === "/" ? "#667eea" : "#4a5568",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: location.pathname === "/" ? "600" : "500",
                            borderRadius: "12px",
                            background: location.pathname === "/" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        🏠 Home
                    </Link>

                    <Link
                        to="/collection"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 20px",
                            color: location.pathname === "/collection" ? "#667eea" : "#4a5568",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: location.pathname === "/collection" ? "600" : "500",
                            borderRadius: "12px",
                            background: location.pathname === "/collection" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        💎 Collections
                    </Link>

                    <Link
                        to="/today-sale"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 20px",
                            background: "linear-gradient(135deg, #ff6b6b 0%, #ff4757 100%)",
                            color: "white",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: "600",
                            borderRadius: "12px",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        🔥 Today Sale
                    </Link>

                    {token && (
                        <Link
                            to="/orders"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "14px 20px",
                                color: location.pathname === "/orders" ? "#667eea" : "#4a5568",
                                textDecoration: "none",
                                fontSize: "16px",
                                fontWeight: location.pathname === "/orders" ? "600" : "500",
                                borderRadius: "12px",
                                background: location.pathname === "/orders" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                                transition: "all 0.2s ease",
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            📦 My Orders
                        </Link>
                    )}

                    <Link
                        to="/contact"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "14px 20px",
                            color: location.pathname === "/contact" ? "#667eea" : "#4a5568",
                            textDecoration: "none",
                            fontSize: "16px",
                            fontWeight: location.pathname === "/contact" ? "600" : "500",
                            borderRadius: "12px",
                            background: location.pathname === "/contact" ? "rgba(102, 126, 234, 0.1)" : "transparent",
                            transition: "all 0.2s ease",
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        📞 Contact
                    </Link>

                    {token && role === "admin" && (
                        <Link
                            to="/admin/dashboard"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "14px 20px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                textDecoration: "none",
                                fontSize: "16px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            👑 Admin Panel
                        </Link>
                    )}
                </div>

                {/* Mobile Auth Section */}
                <div style={{
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: "1px solid rgba(0, 0, 0, 0.05)",
                }}>
                    {token ? (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}>
                            <Link
                                to="/profile"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "14px 20px",
                                    color: "#4a5568",
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    borderRadius: "12px",
                                    background: "rgba(102, 126, 234, 0.1)",
                                }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                👤 My Profile
                            </Link>
                            <button
                                onClick={handleLogout}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    padding: "14px 20px",
                                    color: "#ef4444",
                                    background: "rgba(239, 68, 68, 0.1)",
                                    border: "none",
                                    borderRadius: "12px",
                                    fontSize: "16px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    textAlign: "left",
                                }}
                            >
                                🚪 Logout
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "12px",
                                padding: "16px 20px",
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                textDecoration: "none",
                                fontSize: "16px",
                                fontWeight: "600",
                                borderRadius: "12px",
                                transition: "all 0.2s ease",
                            }}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            👤 Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;