import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import ProductItem from '../components/ProductItem.jsx';
import { Filter, Sparkles, Sliders, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Collection = () => {
    const { products, search, showSearch, setSearch, setShowSearch, subCategories } = useContext(ShopContext);

    const [filterProducts, setFilterProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);
    const [sortType, setSortType] = useState('relevant');
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

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

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            padding: '0',
            margin: '0'
        }}>
            {/* 1. Page Header */}
            <header style={{
                textAlign: 'center',
                padding: '60px 24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderBottom: '1px solid #f3f4f6'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap'
                }}>
                    <Sparkles style={{ color: '#b8860b' }} />
                    <h1 style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: '700',
                        color: '#1a202c',
                        margin: '0'
                    }}>
                        Our Collections
                    </h1>
                    <Sparkles style={{ color: '#b8860b' }} />
                </div>
                <p style={{
                    fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                    color: '#6b7280',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.6'
                }}>
                    Discover exquisite jewelry pieces crafted for eternity
                </p>
            </header>

            {/* 2. Main Content Layout */}
            <div
                className="collection-layout"
                style={{
                    display: 'flex',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    padding: '24px',
                    gap: '32px',
                    position: 'relative'
                }}
            >
                {/* Sidebar Filters */}
                <aside
                    className={`filter-sidebar ${isMobileFiltersOpen ? 'is-open' : ''}`}
                    style={{
                        width: '280px',
                        flexShrink: '0',
                        background: 'white',
                        borderRadius: '16px',
                        padding: '24px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f3f4f6',
                        height: 'fit-content',
                        position: 'sticky',
                        top: '24px'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #f3f4f6'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <Sliders size={20} style={{ color: '#b8860b' }} />
                            <h2 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1a202c',
                                margin: '0'
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
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'none';
                                }}
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            className="filter-close-btn"
                            onClick={() => setIsMobileFiltersOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '8px',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <X size={20} style={{ color: '#6b7280' }} />
                        </button>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        {/* Removed Categories (Material) Section */}
                    </div>

                    <div>
                        <h3 style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1a202c',
                            marginBottom: '16px'
                        }}>
                            Sub Categories
                        </h3>
                        {availableTypes.map(type => (
                            <label key={type} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#4b5563'
                            }}>
                                <input
                                    type="checkbox"
                                    value={type}
                                    checked={subCategory.includes(type)}
                                    onChange={toggleSubCategory}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        accentColor: '#b8860b',
                                        cursor: 'pointer'
                                    }}
                                />
                                {type}
                            </label>
                        ))}
                    </div>
                </aside>

                {/* 3. Product List Area */}
                <main style={{
                    flex: '1',
                    minWidth: '0'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '32px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <button
                            className="filter-open-btn"
                            onClick={() => setIsMobileFiltersOpen(true)}
                            style={{
                                alignItems: 'center',
                                gap: '8px',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                padding: '10px 16px',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#b8860b';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Filter size={18} style={{ color: '#b8860b' }} />
                            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                        </button>

                        <div
                            className="result-text"
                            style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                flex: '1',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            Showing {filterProducts.length} results
                            {search && showSearch && (
                                <span style={{ fontWeight: '600', color: '#1a202c', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    for "{search}"
                                    <X
                                        size={24}
                                        strokeWidth={3}
                                        style={{ cursor: 'pointer', color: '#ef4444', marginLeft: '4px' }}
                                        onClick={() => { setSearch(''); setShowSearch(false); }}
                                    />
                                </span>
                            )}
                        </div>

                        <select
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            style={{
                                padding: '10px 16px',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#1a202c',
                                background: 'white',
                                cursor: 'pointer',
                                minWidth: '200px',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#b8860b';
                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="relevant">Most Relevant</option>
                            <option value="low-high">Price: Low to High</option>
                            <option value="high-low">Price: High to Low</option>
                            <option value="newest">New Arrivals</option>
                        </select>
                    </div>

                    {/* Grid Display */}
                    {isLoading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            color: '#6b7280',
                            fontSize: '18px',
                            fontWeight: '500'
                        }}>
                            Loading jewelry masterpieces...
                        </div>
                    ) : filterProducts.length > 0 ? (
                        <div
                            className="product-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '24px'
                            }}
                        >
                            {filterProducts.map(item => (
                                <ProductItem
                                    key={item._id || item.id}
                                    id={item._id || item.id}
                                    name={item.name}
                                    price={item.price}
                                    image={item.images ?? item.image}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid #f3f4f6'
                        }}>
                            <Search size={48} style={{ color: '#9ca3af', marginBottom: '24px' }} />
                            <h3 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#1a202c',
                                marginBottom: '12px'
                            }}>
                                No products found
                            </h3>
                            <p style={{
                                fontSize: '16px',
                                color: '#6b7280',
                                marginBottom: '32px',
                                maxWidth: '400px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }}>
                                Try adjusting your filters or search terms.
                            </p>
                            <button
                                onClick={clearAllFilters}
                                style={{
                                    background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '14px 32px',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* 4. Footer CTA */}
            <section style={{
                textAlign: 'center',
                padding: '80px 24px',
                background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                borderTop: '1px solid #f3f4f6',
                marginTop: '60px'
            }}>
                <h3 style={{
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#1a202c',
                    marginBottom: '16px'
                }}>
                    Need Help Choosing?
                </h3>
                <p style={{
                    fontSize: '18px',
                    color: '#6b7280',
                    marginBottom: '32px',
                    maxWidth: '500px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.6'
                }}>
                    Book a free consultation with our jewelry experts
                </p>
                <button
                    onClick={() => navigate('/contact')}
                    style={{
                        background: 'white',
                        color: '#b8860b',
                        border: '2px solid #b8860b',
                        padding: '14px 32px',
                        borderRadius: '12px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = '#b8860b';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'white';
                        e.target.style.color = '#b8860b';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    Book Free Consultation
                </button>
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
                        zIndex: '999'
                    }}
                />
            )}

            {/* Embedded style for responsive text alignment */}
            <style>{`
                @media (max-width: 1024px) {
                    .collection-layout {
                        flex-direction: column;
                    }
                }

                @media (max-width: 768px) {
                    .filter-open-btn { display: flex; }
                    .filter-close-btn { display: flex; }

                    .filter-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        width: 100%;
                        height: 100vh;
                        z-index: 1000;
                        border-radius: 0;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        overflow-y: auto;
                        background: white;
                    }
                    .filter-sidebar.is-open {
                        transform: translateX(0);
                    }

                    .filter-overlay { display: none; }
                    .filter-overlay.is-open { display: block; }

                    .result-text { text-align: center; }
                    .product-grid { grid-template-columns: 1fr; }
                }

                @media (min-width: 769px) {
                    .filter-open-btn { display: none; }
                    .filter-close-btn { display: none; }
                }
            `}</style>
        </div>
    );
};

export default Collection;