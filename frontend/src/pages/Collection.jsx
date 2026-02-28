import React, { useContext, useEffect, useRef, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem.jsx';
import { Filter, Sparkles, Sliders, Search, X, ChevronDown, Gem, Star, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Collection = () => {
    const { products, search, showSearch, setSearch, setShowSearch, subCategories } = useContext(ShopContext);

    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState('relevant');
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [mobileSearchQuery, setMobileSearchQuery] = useState('');
    const [showCategoryStrip, setShowCategoryStrip] = useState(true);
    const collectionRef = useRef(null);

    // Hide category strip when collection area is out of view (e.g. scrolled to footer)
    useEffect(() => {
        const node = collectionRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => setShowCategoryStrip(entry.isIntersecting),
            { threshold: 0 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const handleMobileSearch = () => {
        if (!mobileSearchQuery.trim()) return;
        setSearch(mobileSearchQuery);
        setShowSearch(true);
        setMobileSearchQuery('');
    };

    const handleMobileSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleMobileSearch();
        }
    };

    // Derived state for active filters count
    const activeFiltersCount = category.length + subCategory.length + (sortType !== 'relevant' ? 1 : 0);

    const navigate = useNavigate();

    const toggleCategory = (e) => {
        const value = e.target.value;
        setCategory(prev =>
            prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
        );
    };

    const toggleSubCategory = (e) => {
        const value = e.target.value;
        setSubCategory(prev =>
            prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
        );
    };

    // Mobile: single-tap to select/deselect a subcategory
    const toggleMobileSubCategory = (type) => {
        setSubCategory(prev =>
            prev.includes(type) ? prev.filter(i => i !== type) : [...prev, type]
        );
    };

    const clearAllFilters = () => {
        setCategory([]);
        setSubCategory([]);
        setSortType('relevant');
        setSearch('');
        setShowSearch(false);
        setIsLoading(true); // Force loading state to refresh grid
    };

    const applyFilter = () => {
        if (!Array.isArray(products)) {
            setFilterProducts([]);
            setIsLoading(false);
            return;
        }

        let data = [...products];

        if (showSearch && search) {
            data = data.filter(item =>
                (item?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                (item?.subCategory || '').toLowerCase().includes(search.toLowerCase())
            );
        }

        if (category.length > 0) {
            data = data.filter(item => category.includes(item?.category));
        }

        if (subCategory.length > 0) {
            data = data.filter(item => subCategory.includes(item?.subCategory));
        }

        if (sortType === 'low-high') {
            data.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (sortType === 'high-low') {
            data.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (sortType === 'newest') {
            data.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
        }

        setFilterProducts(data);
        setIsLoading(false);
    };

    useEffect(() => {
        setIsLoading(true);
        applyFilter();
    }, [products, search, showSearch, category, subCategory, sortType]);

    // Removed useEffect for activeFiltersCount as it is now a derived state

    const materials = ['Gold', 'Diamond', 'Silver'];
    const defaultTypes = ['Rings', 'Necklace', 'Earrings'];
    // Merge default types with fetched subcategories (names)
    const availableTypes = Array.from(new Set([
        ...defaultTypes,
        ...(subCategories ? subCategories.map(sc => sc.name) : [])
    ]));

    // Emoji mapping for categories
    const getCategoryEmoji = (type) => {
        const emojiMap = {
            'Rings': '💍',
            'Necklace': '📿',
            'Earrings': '✨',
            'Bracelet': '⌚',
            'Bracelets': '⌚',
            'Pendant': '🔮',
            'Pendants': '🔮',
            'default': '💎'
        };
        return emojiMap[type] || emojiMap.default;
    };

    return (
        <div className="collection-page">
            {/* Global Styles */}
            <style>{`
                .collection-page {
                    min-height: 100vh;
                    background: #f5f2e8;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                /* Scrollbar Styling */
                .collection-page ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                .collection-page ::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .collection-page ::-webkit-scrollbar-thumb {
                    background: linear-gradient(45deg, #b8860b, #d4a017);
                    border-radius: 10px;
                }
                .collection-page ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(45deg, #9a7009, #b8860b);
                }

                /* Animations */
                @keyframes shimmer {
                    0% { background-position: -1000px 0; }
                    100% { background-position: 1000px 0; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes pulseGlow {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.4); }
                    50% { box-shadow: 0 0 0 10px rgba(184, 134, 11, 0); }
                }

                .product-grid > * {
                    animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                /* Hover Effects */
                .hover-lift {
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
                }
                .hover-lift:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 25px 50px -12px rgba(184, 134, 11, 0.25);
                }

                /* Responsive Design */
                @media (max-width: 1024px) {
                    .collection-layout {
                        flex-direction: column;
                        padding: 24px !important;
                    }
                    .mobile-search-bar { display: block !important; }
                }

                @media (max-width: 768px) {
                    .mobile-search-bar { 
                        display: block !important;
                        position: sticky;
                        top: 0;
                        z-index: 95;
                        background: rgba(255, 255, 255, 0.95);
                        backdrop-filter: blur(12px);
                        padding: 16px 20px !important;
                    }

                    .mobile-category-strip {
                        display: flex !important;
                        position: sticky;
                        top: 76px;
                        background: rgba(255, 255, 255, 0.9);
                        backdrop-filter: blur(10px);
                        border-bottom: 1px solid rgba(184, 134, 11, 0.1);
                        z-index: 90;
                        padding: 12px 0;
                        overflow-x: auto;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .mobile-category-strip::-webkit-scrollbar { display: none; }

                    .collection-layout {
                        margin-left: 0 !important;
                        padding: 20px !important;
                        gap: 24px !important;
                    }

                    .filter-sidebar {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        bottom: 0 !important;
                        height: 100vh !important;
                        width: 100% !important;
                        max-width: 320px !important;
                        z-index: 1001 !important;
                        border-radius: 0 32px 32px 0 !important;
                        transform: translateX(-100%);
                        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        display: block !important;
                    }

                    .filter-sidebar.is-open {
                        transform: translateX(0);
                        box-shadow: 20px 0 60px rgba(0,0,0,0.2) !important;
                    }

                    .filter-open-btn { display: flex !important; }
                    
                    .result-text { 
                        text-align: center;
                        justify-content: center;
                        width: 100%;
                    }

                    .product-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 16px !important;
                    }

                    .mobile-sort-select {
                        min-width: unset !important;
                        width: 100%;
                    }

                    header {
                        padding: 60px 20px !important;
                    }
                }

                @media (max-width: 480px) {
                    .product-grid {
                        grid-template-columns: repeat(2, 1fr) !important;
                        gap: 12px !important;
                    }

                    .collection-layout {
                        padding: 16px !important;
                    }

                    h1 { font-size: 2.5rem !important; }
                }

                @media (min-width: 769px) {
                    .filter-open-btn { display: none !important; }
                    .filter-close-btn { display: none !important; }
                    .mobile-category-strip { display: none !important; }
                    .filter-sidebar { transform: translateX(0) !important; }
                }

                /* Mobile Category Item Styles - Updated for Horizontal Strip */
                .mobile-cat-item {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border-radius: 24px;
                    padding: 8px 18px !important;
                    margin: 0 6px !important;
                    white-space: nowrap;
                    display: flex !important;
                    flex-direction: row !important;
                    align-items: center !important;
                    gap: 10px !important;
                    background: rgba(255, 255, 255, 0.5);
                    border: 1px solid rgba(184, 134, 11, 0.08) !important;
                }

                .mobile-cat-item:hover {
                    background: rgba(184, 134, 11, 0.05);
                }

                .mobile-cat-item.active {
                    background: linear-gradient(135deg, #b8860b 0%, #d4a017 100%);
                    color: white !important;
                    box-shadow: 0 4px 15px rgba(184, 134, 11, 0.25);
                    border-color: transparent !important;
                }

                .mobile-cat-item.active span {
                    color: white !important;
                    font-weight: 700 !important;
                }
                
                .mobile-cat-item.active div {
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)) !important;
                }

                /* Filter Overlay Animation */
                .filter-overlay {
                    transition: all 0.4s ease;
                    opacity: 0;
                    pointer-events: none;
                }

                .filter-overlay.is-open {
                    opacity: 1;
                    pointer-events: auto;
                }

                /* Loading Animation */
                .loading-shimmer {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 1000px 100%;
                    animation: shimmer 2s infinite;
                }

                /* Glassmorphism Classes */
                .glass-card {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px 0 rgba(184, 134, 11, 0.05);
                }
            `}</style>

            {/* 1. Page Header */}
            <header style={{
                textAlign: 'center',
                padding: '100px 24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #fff9e6 50%, #fef3c7 100%)',
                borderBottom: '1px solid rgba(184, 134, 11, 0.1)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '-100px',
                    left: '-100px',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(184,134,11,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-150px',
                    right: '-150px',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(184,134,11,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '24px',
                    marginBottom: '28px',
                    flexWrap: 'wrap',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <div style={{
                        background: 'linear-gradient(45deg, #b8860b, #d4a017)',
                        padding: '14px',
                        borderRadius: '18px',
                        boxShadow: '0 12px 24px rgba(184, 134, 11, 0.25)',
                        animation: 'fadeIn 0.8s ease-out'
                    }}>
                        <Sparkles size={28} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #1a202c 0%, #b8860b 50%, #1a202c 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0',
                        letterSpacing: '-0.04em',
                        lineHeight: '1.1'
                    }}>
                        Our Collections
                    </h1>

                </div>
            </header>

            {/* Mobile Search Bar */}
            <div className="mobile-search-bar" style={{
                display: 'none',
                padding: '16px 20px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(184, 134, 11, 0.08)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    borderRadius: '50px',
                    padding: '6px 6px 6px 18px',
                    border: '1px solid rgba(184, 134, 11, 0.15)',
                    boxShadow: '0 8px 20px rgba(184, 134, 11, 0.06)',
                    maxWidth: '100%',
                    margin: '0 auto',
                }}>
                    <Search size={18} style={{ color: '#b8860b', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Search our treasures..."
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                        onKeyDown={handleMobileSearchKeyDown}
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#1a202c',
                            padding: '10px 12px',
                        }}
                    />
                    {mobileSearchQuery && (
                        <X
                            size={18}
                            style={{
                                color: '#9ca3af',
                                cursor: 'pointer',
                                padding: '4px',
                                marginRight: '8px'
                            }}
                            onClick={() => setMobileSearchQuery('')}
                        />
                    )}
                    <button
                        onClick={handleMobileSearch}
                        style={{
                            background: 'linear-gradient(45deg, #b8860b, #d4a017)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(184, 134, 11, 0.2)'
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>


            {/* Mobile Category Strip (Horizontal Scroll) */}
            <div className="mobile-category-strip" style={{
                display: 'none',
                opacity: showCategoryStrip ? 1 : 0,
                pointerEvents: showCategoryStrip ? 'auto' : 'none',
                padding: '8px 16px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                }}>
                    <button
                        onClick={() => setSubCategory([])}
                        className={`mobile-cat-item ${subCategory.length === 0 ? 'active' : ''}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                    >
                        <div style={{ fontSize: '20px' }}>✨</div>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>All Treasures</span>
                    </button>

                    {availableTypes.map(type => {
                        const isActive = subCategory.includes(type);
                        return (
                            <button
                                key={type}
                                onClick={() => toggleMobileSubCategory(type)}
                                className={`mobile-cat-item ${isActive ? 'active' : ''}`}
                                style={{ border: 'none', cursor: 'pointer' }}
                            >
                                <div style={{ fontSize: '20px' }}>{getCategoryEmoji(type)}</div>
                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{type}</span>
                            </button>
                        );
                    })}
                </div>
            </div>


            {/* 2. Main Content Layout */}
            <div
                ref={collectionRef}
                className="collection-layout"
                style={{
                    display: 'flex',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '32px',
                    gap: '40px',
                    position: 'relative'
                }}
            >
                {/* Sidebar Filters */}
                <aside
                    className={`filter-sidebar ${isMobileFiltersOpen ? 'is-open' : ''}`}
                    style={{
                        width: '280px',
                        flexShrink: '0',
                        background: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '28px',
                        padding: '32px 24px',
                        boxShadow: '0 20px 40px -20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(184, 134, 11, 0.08) inset',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '40px',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(255, 255, 255, 0.5)'
                    }}
                >

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '28px',
                        paddingBottom: '20px',
                        borderBottom: '2px solid rgba(184, 134, 11, 0.1)'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(45deg, #b8860b, #d4a017)',
                                padding: '10px',
                                borderRadius: '14px',
                                boxShadow: '0 4px 12px rgba(184, 134, 11, 0.2)'
                            }}>
                                <Sliders size={20} color="white" />
                            </div>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '800',
                                color: '#1a202c',
                                margin: '0',
                                letterSpacing: '-0.02em'
                            }}>
                                Filters
                            </h2>
                        </div>

                        {activeFiltersCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#dc2626',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: 'rgba(220, 38, 38, 0.05)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
                                }}
                            >
                                Clear All ({activeFiltersCount})
                            </button>
                        )}
                        <button
                            className="filter-close-btn"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            style={{
                                background: 'rgba(0,0,0,0.05)',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                            }}
                        >
                            <X size={18} style={{ color: '#4b5563' }} />
                        </button>
                    </div>

                    <div style={{ padding: '0 4px' }}>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '700',
                            color: '#1a202c',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            letterSpacing: '0.5px'
                        }}>
                            <span style={{
                                width: '4px',
                                height: '20px',
                                background: 'linear-gradient(45deg, #b8860b, #d4a017)',
                                borderRadius: '4px'
                            }} />
                            Sub Categories
                        </h3>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            {availableTypes.map(type => (
                                <label key={type} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    color: '#4b5563',
                                    padding: '6px 12px',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    background: subCategory.includes(type) ? 'rgba(184, 134, 11, 0.05)' : 'transparent'
                                }}>
                                    <input
                                        type="checkbox"
                                        value={type}
                                        checked={subCategory.includes(type)}
                                        onChange={toggleSubCategory}
                                        style={{
                                            width: '18px',
                                            height: '18px',
                                            accentColor: '#b8860b',
                                            cursor: 'pointer',
                                            borderRadius: '4px'
                                        }}
                                    />
                                    <span style={{
                                        fontWeight: subCategory.includes(type) ? '600' : '400'
                                    }}>
                                        {type}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Sort functionality integrated within sidebar for mobile consistency */}
                        <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid rgba(184, 134, 11, 0.1)' }}>
                            <h3 style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#1a202c',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                <ChevronDown size={16} />
                                Arrange By
                            </h3>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={sortType}
                                    onChange={(e) => setSortType(e.target.value)}
                                    style={{
                                        padding: '14px 18px',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(184, 134, 11, 0.15)',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        color: '#1a202c',
                                        background: 'white',
                                        cursor: 'pointer',
                                        width: '100%',
                                        appearance: 'none',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <option value="relevant">✨ Most Relevant</option>
                                    <option value="low-high">💰 Price: Low to High</option>
                                    <option value="high-low">💎 Price: High to Low</option>
                                    <option value="newest">🌟 New Arrivals</option>
                                </select>
                                <ChevronDown size={14} style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#b8860b',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </div>
                    </div>
                </aside>


                {/* 3. Product List Area */}
                <main style={{
                    flex: '1',
                    minWidth: '0',
                    background: 'linear-gradient(135deg, #eaddc0 0%, #f4eee2 100%)',
                    padding: '40px',
                    borderRadius: '48px',
                    boxShadow: 'inset 0 10px 40px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(184, 134, 11, 0.1)',
                    margin: '0 20px 20px 0'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '16px',
                        background: 'rgba(255, 255, 255, 0.65)',
                        backdropFilter: 'blur(16px)',
                        padding: '14px 24px',
                        borderRadius: '24px',
                        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}>

                        <button
                            className="filter-open-btn"
                            onClick={() => setIsMobileFiltersOpen(true)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(45deg, #b8860b, #d4a017)',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '40px',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: 'white',
                                boxShadow: '0 4px 15px rgba(184, 134, 11, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(184, 134, 11, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(184, 134, 11, 0.2)';
                            }}
                        >
                            <Filter size={18} />
                            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>

                        <div
                            className="result-text"
                            style={{
                                fontSize: '16px',
                                color: '#4b5563',
                                flex: '1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: '500',
                                letterSpacing: '0.01em'
                            }}
                        >
                            <span style={{
                                background: 'linear-gradient(135deg, #fef3c7, #fff9e6)',
                                padding: '6px 16px',
                                borderRadius: '30px',
                                color: '#b8860b',
                                fontWeight: '700',
                                boxShadow: 'inset 0 2px 4px rgba(184, 134, 11, 0.1)'
                            }}>
                                {filterProducts.length}
                            </span>
                            exquisite {filterProducts.length === 1 ? 'piece' : 'pieces'} found
                            {search && showSearch && (
                                <span style={{
                                    fontWeight: '600',
                                    color: '#1a202c',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginLeft: '8px',
                                    background: 'rgba(184, 134, 11, 0.05)',
                                    padding: '4px 12px',
                                    borderRadius: '30px'
                                }}>
                                    for "{search}"
                                    <X
                                        size={16}
                                        strokeWidth={2}
                                        style={{
                                            cursor: 'pointer',
                                            color: '#b8860b',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onClick={() => { setSearch(''); setShowSearch(false); }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = '#b8860b'}
                                    />
                                </span>
                            )}
                        </div>

                        {/* Desktop sort select - hidden on mobile via CSS class */}
                        <div className="mobile-sort-select" style={{ position: 'relative' }}>

                            <select
                                value={sortType}
                                onChange={(e) => setSortType(e.target.value)}
                                className="mobile-sort-select"
                                style={{
                                    padding: '12px 20px 12px 20px',
                                    paddingRight: '40px',
                                    borderRadius: '40px',
                                    border: '2px solid rgba(184, 134, 11, 0.1)',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#1a202c',
                                    background: 'white',
                                    cursor: 'pointer',
                                    minWidth: '200px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    appearance: 'none',
                                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.02)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#b8860b';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(184, 134, 11, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(184, 134, 11, 0.1)';
                                    e.target.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.02)';
                                }}
                            >
                                <option value="relevant">✨ Most Relevant</option>
                                <option value="low-high">💰 Price: Low to High</option>
                                <option value="high-low">💎 Price: High to Low</option>
                                <option value="newest">🌟 New Arrivals</option>
                            </select>
                            <ChevronDown size={16} style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#b8860b',
                                pointerEvents: 'none'
                            }} />
                        </div>
                    </div>

                    {/* Grid Display */}
                    {isLoading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '100px 20px',
                            color: '#b8860b',
                            fontSize: '18px',
                            fontWeight: '500'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto 24px',
                                border: '4px solid rgba(184, 134, 11, 0.1)',
                                borderTopColor: '#b8860b',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <style>{`
                                @keyframes spin {
                                    to { transform: rotate(360deg); }
                                }
                            `}</style>
                            Discovering jewelry masterpieces...
                        </div>
                    ) : filterProducts.length > 0 ? (
                        <div
                            className="product-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '28px'
                            }}
                        >
                            {filterProducts.map((item, index) => (
                                <div
                                    key={item._id || item.id}
                                    style={{
                                        animationDelay: `${index * 0.1}s`,
                                        opacity: 0
                                    }}
                                >
                                    <ProductItem
                                        id={item._id || item.id}
                                        name={item.name}
                                        price={item.price}
                                        image={item.images ?? item.image}
                                        hideQuickAdd={true}
                                        hideImageCount={true}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '100px 20px',
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '32px',
                            border: '1px solid rgba(184, 134, 11, 0.1)',
                            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                margin: '0 auto 32px',
                                background: 'linear-gradient(135deg, #fffbeb 0%, #fff3d6 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '4px solid rgba(184, 134, 11, 0.1)'
                            }}>
                                <Search size={48} style={{ color: '#b8860b', opacity: 0.5 }} />
                            </div>
                            <h3 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                background: 'linear-gradient(135deg, #1a202c, #b8860b)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '16px'
                            }}>
                                No products found
                            </h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                marginBottom: '40px',
                                maxWidth: '450px',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                                lineHeight: '1.8'
                            }}>
                                We couldn't find any pieces matching your criteria.
                                Try adjusting your filters or explore our complete collection.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                style={{
                                    background: 'linear-gradient(45deg, #b8860b, #d4a017, #fbbf24)',
                                    backgroundSize: '200% 200%',
                                    color: 'white',
                                    border: 'none',
                                    padding: '16px 40px',
                                    borderRadius: '40px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 25px rgba(184, 134, 11, 0.3)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundPosition = 'right center';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 15px 30px rgba(184, 134, 11, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundPosition = 'left center';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(184, 134, 11, 0.3)';
                                }}
                            >
                                Explore All Collections
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* 4. Footer CTA */}
            <section style={{
                textAlign: 'center',
                padding: '100px 24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderTop: '2px solid rgba(184, 134, 11, 0.1)',
                marginTop: '80px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-30%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(184,134,11,0.03) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    right: '-10%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(184,134,11,0.03) 0%, transparent 70%)',
                    borderRadius: '50%'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <Award size={32} color="#b8860b" />
                        <Star size={32} color="#b8860b" />
                        <Shield size={32} color="#b8860b" />
                    </div>
                    <h3 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #1a202c, #b8860b)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '16px'
                    }}>
                        Need Help Choosing?
                    </h3>
                    <p style={{
                        fontSize: '18px',
                        color: '#4b5563',
                        marginBottom: '40px',
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                        lineHeight: '1.8'
                    }}>
                        Our jewelry experts are here to guide you.
                        Book a free personalized consultation today.
                    </p>
                    <button
                        onClick={() => navigate('/contact')}
                        style={{
                            background: 'white',
                            color: '#b8860b',
                            border: '2px solid #b8860b',
                            padding: '18px 42px',
                            borderRadius: '40px',
                            fontSize: '18px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 15px rgba(184, 134, 11, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(45deg, #b8860b, #d4a017)';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 15px 30px rgba(184, 134, 11, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#b8860b';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(184, 134, 11, 0.1)';
                        }}
                    >
                        Book Free Consultation
                    </button>
                </div>
            </section>

            {/* Mobile Filter Overlay */}
            {isMobileFiltersOpen && (
                <div
                    className={`filter-overlay ${isMobileFiltersOpen ? 'is-open' : ''}`}
                    onClick={() => setIsMobileFiltersOpen(false)}
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: 'rgba(0, 0, 0, 0.5)',
                        backdropFilter: 'blur(4px)',
                        zIndex: '999',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            )}
        </div>
    );
};

export default Collection;