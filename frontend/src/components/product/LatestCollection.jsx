import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../../context/ShopContext.jsx';
import ProductItem from '../ProductItem.jsx';
import { Sparkles, ChevronRight, Package, Star } from 'lucide-react';

const LatestCollection = () => {
    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const [isHoveringViewAll, setIsHoveringViewAll] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (Array.isArray(products)) {
            setLoading(false);
            if (products.length > 0) {
                // Sort by creation date or ID to get truly latest products
                const sortedProducts = [...products]
                    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    .slice(0, 10);
                setLatestProducts(sortedProducts);
            } else {
                setLatestProducts([]);
            }
        } else {
            setLoading(false);
            setLatestProducts([]);
        }
    }, [products]);

    // Loading skeleton
    if (loading) {
        return (
            <div style={{
                marginTop: '60px',
                marginBottom: '80px',
                padding: '0 24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                    rowGap: '28px'
                }}>
                    {[...Array(10)].map((_, index) => (
                        <div
                            key={index}
                            style={{
                                height: '400px',
                                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 2s infinite',
                                borderRadius: '24px',
                                width: '100%'
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div style={{
            marginTop: '60px',
            marginBottom: '80px',
            padding: '0 24px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'float 15s ease-in-out infinite'
            }}></div>

            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'float 20s ease-in-out infinite alternate'
            }}></div>

            {/* Header Section - Enhanced */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '48px',
                padding: '0 4px',
                position: 'relative',
                zIndex: 2,
                flexWrap: 'wrap',
                gap: '24px'
            }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.3)',
                            animation: 'pulse 2s ease-in-out infinite',
                            flexShrink: 0
                        }}>
                            <Sparkles size={24} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{
                                fontSize: 'clamp(24px, 5vw, 32px)',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                marginBottom: '8px',
                                letterSpacing: '-0.025em',
                                fontFamily: "'Playfair Display', serif",
                                lineHeight: '1.2'
                            }}>
                                Latest Collection
                            </h2>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px',
                                flexWrap: 'wrap'
                            }}>
                                <div style={{
                                    width: '32px',
                                    height: '2px',
                                    background: 'linear-gradient(90deg, #b8860b 0%, #fbbf24 100%)',
                                    borderRadius: '1px'
                                }}></div>
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: '#b8860b',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase'
                                }}>
                                    Just Arrived
                                </span>
                            </div>
                        </div>
                    </div>

                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        lineHeight: '1.8',
                        maxWidth: '500px',
                        marginLeft: '60px',
                        background: 'rgba(255, 255, 255, 0.8)',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        borderLeft: '4px solid #fbbf24',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
                    }}>
                        Discover our exclusive new arrivals, featuring meticulously crafted pieces that blend timeless elegance with contemporary design. Each item showcases unparalleled craftsmanship and premium materials.
                    </p>
                </div>

                {latestProducts.length > 5 && (
                    <div style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '8px',
                        flexShrink: 0
                    }}>
                        <a
                            href="/collection"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: '#1a202c',
                                fontSize: '15px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                padding: '14px 28px',
                                borderRadius: '12px',
                                border: '2px solid #e5e7eb',
                                backgroundColor: '#fff',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                zIndex: 1
                            }}
                            onMouseEnter={() => setIsHoveringViewAll(true)}
                            onMouseLeave={() => setIsHoveringViewAll(false)}
                        >
                            <span style={{
                                background: 'linear-gradient(135deg, #b8860b 0%, #fbbf24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: '700',
                                letterSpacing: '-0.01em'
                            }}>
                                Explore Collection
                            </span>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                                transition: 'transform 0.4s ease',
                                transform: isHoveringViewAll ? 'translateX(4px) rotate(-5deg)' : 'translateX(0) rotate(0)'
                            }}>
                                <ChevronRight size={18} color="#fff" />
                            </div>

                            {/* Animated border */}
                            <div style={{
                                position: 'absolute',
                                top: '-2px',
                                left: '-2px',
                                right: '-2px',
                                bottom: '-2px',
                                borderRadius: '14px',
                                background: 'linear-gradient(135deg, #fbbf24, #b8860b, #fbbf24)',
                                zIndex: -1,
                                opacity: isHoveringViewAll ? 1 : 0,
                                transition: 'opacity 0.4s ease'
                            }}></div>
                        </a>

                        <p style={{
                            fontSize: '13px',
                            color: '#9ca3af',
                            textAlign: 'right',
                            maxWidth: '200px',
                            lineHeight: '1.4'
                        }}>
                            {latestProducts.length} exquisite pieces awaiting discovery
                        </p>
                    </div>
                )}
            </div>

            {/* Products Grid Container */}
            <div style={{
                width: '100%',
                position: 'relative',
                zIndex: 2
            }}>
                {/* Responsive Grid */}
                <div className="responsive-grid-container" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '20px',
                    rowGap: '28px',
                    position: 'relative'
                }}>
                    {latestProducts.map((item, index) => (
                        <div
                            key={item?._id || item?.id || index}
                            style={{
                                animation: 'slideUp 0.6s ease-out',
                                animationDelay: `${index * 0.05}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            <ProductItem
                                id={item?._id || item?.id}
                                image={item?.images ?? item?.image}
                                name={item?.name}
                                price={item?.price}
                                category={item?.category}
                                rating={item?.rating}
                            />
                        </div>
                    ))}
                </div>

                {/* Decorative elements between products */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: -1,
                    opacity: 0.1,
                    background: 'radial-gradient(circle at 50% 50%, rgba(184, 134, 11, 0.1) 0%, transparent 50%)'
                }}></div>
            </div>

            {/* No Products State */}
            {latestProducts.length === 0 && !loading && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 24px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderRadius: '20px',
                    marginTop: '40px',
                    border: '2px dashed #e2e8f0',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(10px)'
                }}>
                    {/* Background pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '30px 30px',
                        opacity: 0.2
                    }}></div>

                    <div style={{
                        width: '96px',
                        height: '96px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '32px',
                        boxShadow: '0 12px 40px rgba(251, 191, 36, 0.3)',
                        position: 'relative',
                        zIndex: 1,
                        animation: 'pulse 3s ease-in-out infinite'
                    }}>
                        <Package size={48} color="#fff" strokeWidth={1.5} />
                    </div>

                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: '500px'
                    }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #1a202c 0%, #4b5563 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '16px',
                            fontFamily: "'Playfair Display', serif"
                        }}>
                            Collection Refresh in Progress
                        </h3>

                        <p style={{
                            fontSize: '16px',
                            color: '#64748b',
                            marginBottom: '24px',
                            lineHeight: '1.7'
                        }}>
                            We're currently curating an exceptional new collection featuring exquisite craftsmanship and premium materials. Our artisans are meticulously preparing pieces that embody timeless elegance and contemporary sophistication.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <button
                                onClick={() => window.location.href = '/collection'}
                                style={{
                                    padding: '14px 32px',
                                    background: 'linear-gradient(135deg, #b8860b 0%, #fbbf24 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 8px 32px rgba(184, 134, 11, 0.3)',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(184, 134, 11, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(184, 134, 11, 0.3)';
                                }}
                            >
                                <span style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    Explore Collections
                                    <Star size={18} fill="white" />
                                </span>
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '14px 32px',
                                    backgroundColor: 'transparent',
                                    color: '#64748b',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.borderColor = '#cbd5e1';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View All Section for Mobile */}
            {latestProducts.length > 0 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '48px',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '400px',
                        position: 'relative'
                    }}>
                        <a
                            href="/collection"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                                color: 'white',
                                padding: '18px 32px',
                                borderRadius: '16px',
                                fontSize: '15px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(26, 32, 44, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 16px 48px rgba(26, 32, 44, 0.3)';
                                e.currentTarget.querySelector('.arrow-icon')?.style.transform = 'translateX(8px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(26, 32, 44, 0.2)';
                                e.currentTarget.querySelector('.arrow-icon')?.style.transform = 'translateX(0)';
                            }}
                        >
                            <span>View Complete Collection</span>
                            <div className="arrow-icon" style={{
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'transform 0.4s ease'
                            }}>
                                <ChevronRight size={20} />
                            </div>

                            {/* Shimmer effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                                animation: 'shimmer 2s infinite'
                            }}></div>
                        </a>

                        <p style={{
                            textAlign: 'center',
                            fontSize: '13px',
                            color: '#9ca3af',
                            marginTop: '12px',
                            lineHeight: '1.4'
                        }}>
                            Discover {latestProducts.length} meticulously crafted pieces
                        </p>
                    </div>
                </div>
            )}

            {/* Premium Divider */}
            <div style={{
                marginTop: '60px',
                position: 'relative',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #fbbf24, #b8860b, #fbbf24, transparent)',
                width: '100%',
                opacity: 0.3
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'white',
                    padding: '0 20px'
                }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                        boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                    }}></div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>
                {`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    33% { transform: translate(30px, -50px) rotate(120deg); }
                    66% { transform: translate(-20px, 20px) rotate(240deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                /* Responsive Grid Styles */
                .responsive-grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    rowGap: 28px;
                }

                @media (min-width: 640px) {
                    .responsive-grid-container {
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 24px;
                    }
                }
                
                @media (min-width: 768px) {
                    .responsive-grid-container {
                        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                        gap: 28px;
                    }
                }
                
                @media (min-width: 1024px) {
                    .responsive-grid-container {
                        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                        gap: 32px;
                    }
                }
                
                @media (min-width: 1280px) {
                    .responsive-grid-container {
                        grid-template-columns: repeat(5, 1fr);
                        gap: 32px;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default LatestCollection;