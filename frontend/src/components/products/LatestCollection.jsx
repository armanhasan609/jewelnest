import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../../context/ShopContext.jsx'
import ProductItem from '../ProductItem.jsx'

const LatestCollection = () => {
    const { products } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);
    const [isHoveringViewAll, setIsHoveringViewAll] = useState(false);

    useEffect(() => {
        if (Array.isArray(products) && products.length > 0) {
            // Sort by newest first (assuming there's a createdAt field)
            const sortedProducts = [...products]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 10);
            setLatestProducts(sortedProducts);
        } else {
            setLatestProducts([]);
        }
    }, [products]);

    return (
        <section className="latest-collection-section" style={{
            padding: '6rem 1rem',
            background: 'linear-gradient(180deg, #f5f2e8 0%, #eaddc0 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, transparent 70%)',
                transform: 'translate(30%, -30%)'
            }} />
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, transparent 70%)',
                transform: 'translate(-30%, 30%)'
            }} />

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginBottom: '3.5rem'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 1.25rem',
                        background: 'rgba(184, 134, 11, 0.1)',
                        borderRadius: '50px',
                        marginBottom: '1rem',
                        border: '1px solid rgba(184, 134, 11, 0.2)'
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            background: '#b8860b',
                            borderRadius: '50%',
                            animation: 'pulse 2s infinite'
                        }} />
                        <span style={{
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            color: '#b8860b',
                            letterSpacing: '0.05em'
                        }}>
                            NEW ARRIVALS
                        </span>
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: '800',
                        color: '#1a202c',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, #1a202c 0%, #4a5568 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1.2
                    }}>
                        Latest Collection
                    </h2>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.125rem)',
                        color: '#6b7280',
                        maxWidth: '600px',
                        lineHeight: 1.6,
                        marginBottom: '2rem'
                    }}>
                        Discover our newest arrivals featuring premium quality and timeless designs
                    </p>

                    {latestProducts.length > 5 && (
                        <a
                            href="/collection"
                            className="view-all-button"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: 'linear-gradient(135deg, #b8860b 0%, #d4a017 100%)',
                                color: 'white',
                                padding: '0.875rem 2rem',
                                borderRadius: '12px',
                                fontSize: '0.9375rem',
                                fontWeight: '600',
                                textDecoration: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 20px rgba(184, 134, 11, 0.2)',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={() => setIsHoveringViewAll(true)}
                            onMouseLeave={() => setIsHoveringViewAll(false)}
                        >
                            <span style={{
                                position: 'relative',
                                zIndex: 2,
                                transition: 'transform 0.3s ease'
                            }}>
                                View All Products
                            </span>
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                style={{
                                    transition: 'transform 0.3s ease',
                                    transform: isHoveringViewAll ? 'translateX(4px)' : 'none'
                                }}
                            >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #d4a017 0%, #e9b824 100%)',
                                transition: 'left 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                zIndex: 1
                            }} />
                        </a>
                    )}
                </div>

                {/* Products Grid */}
                <div style={{
                    display: 'grid',
                    gap: '1.5rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    justifyItems: 'center'
                }}>
                    {latestProducts.map((item, index) => (
                        <div
                            key={item?._id || item?.id}
                            style={{
                                width: '100%',
                                maxWidth: '320px',
                                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                            }}
                        >
                            <ProductItem
                                id={item?._id || item?.id}
                                image={item?.images ?? item?.image}
                                name={item?.name}
                                price={item?.price}
                                category={item?.category}
                                rating={item?.rating}
                                isNew={true}
                            />
                        </div>
                    ))}
                </div>

                {/* No Products Message */}
                {latestProducts.length === 0 && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '5rem 2rem',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        borderRadius: '20px',
                        border: '2px dashed #e2e8f0',
                        marginTop: '2rem'
                    }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '2rem',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#b8860b"
                                strokeWidth="1.5"
                            >
                                <path d="M20 7h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v3H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z" />
                                <path d="M12 12v5M8 12v5M16 12v5" />
                            </svg>
                        </div>
                        <h3 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: '#334155',
                            marginBottom: '0.75rem'
                        }}>
                            Collection Coming Soon
                        </h3>
                        <p style={{
                            fontSize: '1rem',
                            color: '#64748b',
                            maxWidth: '500px',
                            lineHeight: 1.6,
                            marginBottom: '2rem'
                        }}>
                            We're curating something special for you. Our latest collection will be available soon!
                        </p>
                    </div>
                )}

                {/* Decorative Bottom Line */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem',
                    marginTop: '4rem',
                    opacity: 0.5
                }}>
                    <div style={{ width: '40px', height: '1px', background: '#cbd5e0' }} />
                    <span style={{
                        fontSize: '0.875rem',
                        color: '#94a3b8',
                        fontStyle: 'italic'
                    }}>
                        Discover more
                    </span>
                    <div style={{ width: '40px', height: '1px', background: '#cbd5e0' }} />
                </div>
            </div>

            {/* Global Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.7;
                        transform: scale(1.05);
                    }
                }
                
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                
                .view-all-button:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 30px rgba(184, 134, 11, 0.3);
                }
                
                .view-all-button:hover div {
                    left: 100%;
                }
                
                .latest-collection-section {
                    scroll-margin-top: 80px;
                }
                
                @media (max-width: 768px) {
                    .latest-collection-section {
                        padding: 3rem 1rem;
                    }
                    
                    .products-grid {
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                    }
                }
                
                @media (max-width: 640px) {
                    .products-grid {
                        grid-template-columns: 1fr;
                        max-width: 400px;
                        margin: 0 auto;
                    }
                }
            `}</style>
        </section>
    );
};

export default LatestCollection;