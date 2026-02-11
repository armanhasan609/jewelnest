import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductTable from '../components/ProductTable';

const Dashboard = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL ;

    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${backendUrl}/api/products/all`);
            // Handle both response formats
            const productsData = res.data.success ? res.data.products : res.data;
            setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (err) {
            console.error("Error fetching products", err);
            setError("Failed to load products. Please try again.");
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this jewelry item?")) {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
                await axios.post(`${backendUrl}/api/products/remove`, { id });
                fetchProducts();
            } catch (err) {
                alert("Delete failed. Please try again.");
            }
        }
    };

    useEffect(() => {
        console.log("Dashboard Loaded, fetching products...");
        fetchProducts();
    }, []);

    // Responsive styles
    const containerStyle = {
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        padding: 'clamp(16px, 4vw, 32px)',
        backgroundColor: '#f9fafb',
        minHeight: '100vh',
        margin: '0',
        overflowX: 'hidden'
    };

    const headerStyle = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'clamp(24px, 3vw, 32px)',
        gap: 'clamp(12px, 2vw, 16px)',
        width: '100%'
    };

    const headerInnerStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        flexWrap: 'wrap',
        gap: '16px'
    };

    const titleStyle = {
        fontSize: 'clamp(22px, 4vw, 28px)',
        fontWeight: '700',
        color: '#1a202c',
        letterSpacing: '-0.025em',
        lineHeight: '1.2'
    };

    const badgeStyle = {
        backgroundColor: '#1a202c',
        color: 'white',
        padding: 'clamp(6px, 1vw, 8px) clamp(12px, 2vw, 20px)',
        borderRadius: '20px',
        fontSize: 'clamp(12px, 1.5vw, 14px)',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'clamp(4px, 1vw, 8px)',
        marginTop: 'clamp(8px, 1vw, 0)',
        alignSelf: 'flex-start'
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(1, 1fr)',
        gap: 'clamp(16px, 2vw, 20px)',
        marginBottom: 'clamp(24px, 3vw, 32px)',
        width: '100%'
    };

    const statCardStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: 'clamp(16px, 2vw, 24px)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6',
        transition: 'all 0.3s ease',
        minWidth: '0',
        overflow: 'hidden'
    };

    const statValueStyle = {
        fontSize: 'clamp(24px, 3vw, 32px)',
        fontWeight: '700',
        color: '#1a202c',
        lineHeight: '1.2'
    };

    const statTitleStyle = {
        fontSize: 'clamp(11px, 1vw, 12px)',
        color: '#6b7280',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 'clamp(6px, 1vw, 8px)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const loadingContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 8vw, 60px) 20px',
        textAlign: 'center'
    };

    const loadingSpinnerStyle = {
        width: 'clamp(40px, 8vw, 50px)',
        height: 'clamp(40px, 8vw, 50px)',
        border: '4px solid #f3f4f6',
        borderTopColor: '#b8860b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: 'clamp(16px, 2vw, 20px)'
    };

    const errorContainerStyle = {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: 'clamp(16px, 3vw, 24px)',
        textAlign: 'center',
        marginTop: '20px',
        width: '100%'
    };

    const emptyStateStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(40px, 8vw, 60px) 20px',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px dashed #d1d5db',
        marginTop: '20px',
        width: '100%'
    };

    const refreshButtonStyle = {
        backgroundColor: '#b8860b',
        color: 'white',
        border: 'none',
        padding: 'clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 24px)',
        borderRadius: '8px',
        fontSize: 'clamp(13px, 1.5vw, 14px)',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'clamp(6px, 1vw, 8px)',
        marginTop: '16px',
        minWidth: '120px',
        justifyContent: 'center'
    };

    const refreshButtonHoverStyle = {
        backgroundColor: '#a4710a',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(184, 134, 11, 0.3)'
    };

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div style={headerInnerStyle}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={titleStyle}>Jewelry Inventory</h1>
                        <p style={{
                            fontSize: 'clamp(13px, 1.5vw, 14px)',
                            color: '#6b7280',
                            marginTop: 'clamp(4px, 0.5vw, 8px)',
                            maxWidth: '600px',
                            lineHeight: '1.5'
                        }}>
                            Manage your jewelry collection, track inventory, and update product details
                        </p>
                    </div>
                    <div style={badgeStyle}>
                        <svg
                            width="clamp(14px, 1vw, 16px)"
                            height="clamp(14px, 1vw, 16px)"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                        Total: {products.length} Items
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={statsGridStyle}>
                {[
                    { title: 'Total Products', value: products.length, icon: '📦', color: '#3b82f6' },
                    { title: 'Gold Items', value: products.filter(p => p.category === 'Gold').length, icon: '💰', color: '#f59e0b' },
                    { title: 'Diamond Items', value: products.filter(p => p.category === 'Diamond').length, icon: '💎', color: '#8b5cf6' },
                    { title: 'Bestsellers', value: products.filter(p => p.bestseller).length, icon: '⭐', color: '#10b981' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={statCardStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={statTitleStyle}>
                                    {stat.title}
                                </div>
                                <div style={statValueStyle}>
                                    {stat.value}
                                </div>
                            </div>
                            <div style={{
                                width: 'clamp(40px, 4vw, 48px)',
                                height: 'clamp(40px, 4vw, 48px)',
                                minWidth: 'clamp(40px, 4vw, 48px)',
                                borderRadius: '12px',
                                backgroundColor: `${stat.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(20px, 2.5vw, 24px)',
                                flexShrink: 0
                            }}>
                                {stat.icon}
                            </div>
                        </div>
                        <div style={{
                            fontSize: 'clamp(10px, 1vw, 12px)',
                            color: '#6b7280',
                            marginTop: 'clamp(8px, 1vw, 12px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                            Updated just now
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={loadingContainerStyle}>
                    <div style={loadingSpinnerStyle}></div>
                    <h3 style={{
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        fontWeight: '600',
                        color: '#4b5563',
                        marginBottom: '8px'
                    }}>
                        Loading Inventory...
                    </h3>
                    <p style={{
                        fontSize: 'clamp(13px, 1.5vw, 14px)',
                        color: '#6b7280',
                        maxWidth: '400px'
                    }}>
                        Fetching your jewelry products from the database
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div style={errorContainerStyle}>
                    <div style={{
                        width: 'clamp(40px, 4vw, 48px)',
                        height: 'clamp(40px, 4vw, 48px)',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <svg
                            width="clamp(20px, 2.5vw, 24px)"
                            height="clamp(20px, 2.5vw, 24px)"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#dc2626"
                            strokeWidth="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <h3 style={{
                        fontSize: 'clamp(16px, 2vw, 18px)',
                        fontWeight: '600',
                        color: '#dc2626',
                        marginBottom: '8px'
                    }}>
                        Failed to Load
                    </h3>
                    <p style={{
                        fontSize: 'clamp(13px, 1.5vw, 14px)',
                        color: '#6b7280',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </p>
                    <button
                        onClick={fetchProducts}
                        style={refreshButtonStyle}
                        onMouseEnter={(e) => Object.assign(e.currentTarget.style, refreshButtonHoverStyle)}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#b8860b';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <svg
                            width="clamp(14px, 1vw, 16px)"
                            height="clamp(14px, 1vw, 16px)"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                        </svg>
                        Try Again
                    </button>
                </div>
            )}

            {/* Products Table or Empty State */}
            {!loading && !error && (
                <>
                    {products.length > 0 ? (
                        <ProductTable products={products} onDelete={handleDelete} />
                    ) : (
                        <div style={emptyStateStyle}>
                            <div style={{
                                width: 'clamp(48px, 6vw, 64px)',
                                height: 'clamp(48px, 6vw, 64px)',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <svg
                                    width="clamp(24px, 3vw, 32px)"
                                    height="clamp(24px, 3vw, 32px)"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth="1.5"
                                >
                                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <path d="M16 10a4 4 0 01-8 0" />
                                </svg>
                            </div>
                            <h3 style={{
                                fontSize: 'clamp(16px, 2vw, 18px)',
                                fontWeight: '600',
                                color: '#4b5563',
                                marginBottom: '8px'
                            }}>
                                No Products Found
                            </h3>
                            <p style={{
                                fontSize: 'clamp(13px, 1.5vw, 14px)',
                                color: '#6b7280',
                                maxWidth: '400px',
                                marginBottom: '24px',
                                lineHeight: '1.5'
                            }}>
                                Your inventory is empty. Add your first jewelry product to get started.
                            </p>
                            <button
                                onClick={() => window.location.href = '/admin/add-product'}
                                style={refreshButtonStyle}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, refreshButtonHoverStyle)}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#b8860b';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <svg
                                    width="clamp(14px, 1vw, 16px)"
                                    height="clamp(14px, 1vw, 16px)"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                                Add First Product
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Quick Actions */}
            {!loading && !error && products.length > 0 && (
                <div style={{
                    marginTop: 'clamp(24px, 3vw, 32px)',
                    padding: 'clamp(16px, 2vw, 24px)',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid #f3f4f6',
                    width: '100%'
                }}>
                    <h3 style={{
                        fontSize: 'clamp(14px, 1.5vw, 16px)',
                        fontWeight: '600',
                        color: '#1a202c',
                        marginBottom: '16px'
                    }}>
                        Quick Actions
                    </h3>
                    <div style={{
                        display: 'flex',
                        gap: 'clamp(8px, 1.5vw, 12px)',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => window.location.href = '/admin/add-product'}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'clamp(6px, 1vw, 8px)',
                                backgroundColor: '#b8860b',
                                color: 'white',
                                padding: 'clamp(8px, 1.5vw, 10px) clamp(16px, 2vw, 20px)',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: 'clamp(13px, 1.5vw, 14px)',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '140px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#a4710a';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#b8860b';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <svg width="clamp(14px, 1vw, 16px)" height="clamp(14px, 1vw, 16px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            Add New Product
                        </button>
                        <button
                            onClick={fetchProducts}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'clamp(6px, 1vw, 8px)',
                                backgroundColor: 'white',
                                color: '#374151',
                                padding: 'clamp(8px, 1.5vw, 10px) clamp(16px, 2vw, 20px)',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                fontSize: 'clamp(13px, 1.5vw, 14px)',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minWidth: '120px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <svg width="clamp(14px, 1vw, 16px)" height="clamp(14px, 1vw, 16px)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                            </svg>
                            Refresh Data
                        </button>
                    </div>
                </div>
            )}

            {/* CSS Animations + Responsive Grid */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                /* Responsive grid breakpoints */
                @media (min-width: 480px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                }
                
                @media (min-width: 768px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .header-container {
                        flex-direction: row;
                        align-items: center;
                    }
                    .badge-container {
                        margin-top: 0;
                        align-self: center;
                    }
                }
                
                @media (min-width: 1024px) {
                    .stats-grid { grid-template-columns: repeat(4, 1fr); }
                }
                
                /* Prevent text overflow */
                .truncate {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                /* Responsive typography */
                @media (max-width: 640px) {
                    .responsive-text {
                        font-size: 14px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;