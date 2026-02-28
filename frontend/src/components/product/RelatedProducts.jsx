import React, { useEffect, useState } from 'react';
import ProductItem from './ProductItem';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Filter, Star, Image as ImageIcon } from 'lucide-react';

const RelatedProducts = ({ category, products }) => {
    const [related, setRelated] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [columns, setColumns] = useState(2);
    const [isHoveringButton, setIsHoveringButton] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth >= 1280) setColumns(4);
            else if (window.innerWidth >= 1024) setColumns(4);
            else if (window.innerWidth >= 768) setColumns(3);
            else if (window.innerWidth >= 640) setColumns(2);
            else setColumns(2);
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    // Helper function to get the main image
    const getMainImage = (item) => {
        if (!item) return '';

        // If item has images array, use the first one
        if (Array.isArray(item.images) && item.images.length > 0) {
            return item.images[0];
        }

        // If item has image property
        if (item.image) {
            // Check if it's an array or string
            if (Array.isArray(item.image)) {
                return item.image[0] || '';
            }
            return item.image;
        }

        // Fallback to default image
        return 'https://placehold.co/400x400?text=No+Image';
    };

    // Helper function to get images array
    const getImagesArray = (item) => {
        if (!item) return [];

        // If item has images array
        if (Array.isArray(item.images)) {
            return item.images;
        }

        // If item has single image property
        if (item.image) {
            // If it's already an array, return it
            if (Array.isArray(item.image)) {
                return item.image;
            }
            // If it's a single string, wrap in array
            return [item.image];
        }

        return [];
    };

    // Function to check if product has multiple images
    const hasMultipleImages = (item) => {
        const images = getImagesArray(item);
        return images.length > 1;
    };

    useEffect(() => {
        setIsLoading(true);
        if (products?.length) {
            // Filter by category and ensure we get high-quality related items
            const relatedProducts = products
                .filter(item => item.subCategory === category)
                .map(item => ({
                    ...item,
                    // Ensure we have proper image handling
                    mainImage: getMainImage(item),
                    imagesArray: getImagesArray(item),
                    hasMultipleImages: hasMultipleImages(item),
                    imageCount: getImagesArray(item).length
                }))
                .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Sort by rating
                .slice(0, 4);

            setRelated(relatedProducts);
        }
        setIsLoading(false);
    }, [products, category]);

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '32px',
        position: 'relative'
    };

    // Calculate total images
    const totalImages = related.reduce((total, item) => total + item.imageCount, 0);
    const productsWithMultipleImages = related.filter(item => item.hasMultipleImages).length;

    return (
        <div style={{
            margin: '120px auto 80px',
            padding: '0 24px',
            maxWidth: '1400px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-150px',
                right: '-150px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'float 20s ease-in-out infinite'
            }}></div>

            <div style={{
                position: 'absolute',
                bottom: '-100px',
                left: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, transparent 70%)',
                borderRadius: '50%',
                zIndex: 0,
                animation: 'float 25s ease-in-out infinite reverse'
            }}></div>

            {/* Header Section */}
            <div style={{
                textAlign: 'center',
                marginBottom: '64px',
                position: 'relative',
                zIndex: 2
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    padding: '10px 24px',
                    backgroundColor: 'rgba(184, 134, 11, 0.1)',
                    borderRadius: '30px',
                    border: '1px solid rgba(184, 134, 11, 0.2)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <Filter size={16} color="#b8860b" />
                    <p style={{
                        fontSize: '13px',
                        fontWeight: '700',
                        color: '#b8860b',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        margin: 0
                    }}>
                        Curated Selection
                    </p>
                </div>

                <h2 style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '20px',
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: '1.1',
                    letterSpacing: '-0.025em'
                }}>
                    Complementary Elegance
                </h2>

                <p style={{
                    fontSize: '18px',
                    color: '#6b7280',
                    maxWidth: '600px',
                    margin: '0 auto 32px',
                    lineHeight: '1.7'
                }}>
                    Discover pieces that perfectly complement your style. Each selection is curated to match the sophistication and quality of your previous choice.
                </p>


                {/* Decorative Elements */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        width: '60px',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #b8860b)',
                        borderRadius: '1px'
                    }}></div>
                    <Sparkles size={20} color="#b8860b" fill="#b8860b" />
                    <div style={{
                        width: '60px',
                        height: '2px',
                        background: 'linear-gradient(90deg, #b8860b, transparent)',
                        borderRadius: '1px'
                    }}></div>
                </div>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: 'rgba(249, 250, 251, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(229, 231, 235, 0.6)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#4b5563'
                    }}>
                        {related.length} exclusive {category} pieces
                    </span>
                </div>
            </div>

            {/* Products Grid Container */}
            <div style={{
                position: 'relative',
                zIndex: 2
            }}>
                <div style={gridStyle}>
                    {isLoading ? (
                        // Enhanced Loading Skeletons
                        Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                                    borderRadius: '20px',
                                    height: '380px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(229, 231, 235, 0.5)'
                                }}
                            >
                                {/* Shimmer Effect */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                                    animation: 'shimmer 2s infinite',
                                    transform: 'skewX(-20deg)'
                                }}></div>
                            </div>
                        ))
                    ) : (
                        related.map((item, index) => (
                            <div
                                key={item._id}
                                style={{
                                    animation: 'slideUp 0.6s ease-out',
                                    animationDelay: `${index * 0.1}s`,
                                    animationFillMode: 'both',
                                    position: 'relative',
                                    cursor: 'pointer' // Add pointer cursor
                                }}
                                onClick={() => navigate(`/product/${item._id}`)} // Add navigation on click
                            >


                                <ProductItem
                                    id={item._id}
                                    name={item.name}
                                    price={item.price}
                                    image={item.mainImage}
                                    images={item.imagesArray}
                                    product={item}
                                    rating={item.rating}
                                    badge="Related"
                                    hasMultipleImages={item.hasMultipleImages}
                                    imageCount={item.imageCount}
                                />
                            </div>
                        ))
                    )}
                </div>

                {/* Decorative Grid Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    left: '-20px',
                    right: '-20px',
                    bottom: '-20px',
                    backgroundImage: 'radial-gradient(circle, rgba(184, 134, 11, 0.02) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    pointerEvents: 'none',
                    zIndex: -1,
                    opacity: 0.5
                }}></div>
            </div>

            {/* View More Section */}
            {!isLoading && related.length > 0 && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '80px',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>

                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            maxWidth: '500px',
                            marginBottom: '8px',
                            lineHeight: '1.6'
                        }}>
                            Explore our complete {category} collection featuring premium craftsmanship and comprehensive product photography
                        </p>

                        <button
                            onClick={() => navigate(`/collection?category=${category}`)}
                            onMouseEnter={() => setIsHoveringButton(true)}
                            onMouseLeave={() => setIsHoveringButton(false)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '16px',
                                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                                color: '#fff',
                                padding: '18px 42px',
                                borderRadius: '16px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                                letterSpacing: '0.5px',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(26, 32, 44, 0.2)'
                            }}
                        >
                            {/* Background glow effect */}
                            <div style={{
                                position: 'absolute',
                                top: '-20px',
                                left: '-20px',
                                right: '-20px',
                                bottom: '-20px',
                                background: 'linear-gradient(135deg, rgba(184, 134, 11, 0.1) 0%, rgba(184, 134, 11, 0.2) 100%)',
                                filter: 'blur(20px)',
                                opacity: isHoveringButton ? 1 : 0,
                                transition: 'opacity 0.4s ease',
                                zIndex: -1
                            }}></div>

                            <span style={{
                                position: 'relative',
                                zIndex: 1
                            }}>
                                Explore More {category}
                            </span>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'transform 0.4s ease',
                                transform: isHoveringButton ? 'translateX(8px)' : 'translateX(0)'
                            }}>
                                <ChevronRight size={20} />
                                <ChevronRight size={20} style={{
                                    marginLeft: '-12px',
                                    opacity: isHoveringButton ? 1 : 0,
                                    transition: 'opacity 0.3s ease'
                                }} />
                            </div>

                            {/* Animated border */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: '16px',
                                border: '2px solid transparent',
                                background: 'linear-gradient(135deg, #b8860b, #fbbf24, #b8860b) border-box',
                                WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                                WebkitMaskComposite: 'xor',
                                maskComposite: 'exclude',
                                opacity: isHoveringButton ? 1 : 0,
                                transition: 'opacity 0.4s ease'
                            }}></div>
                        </button>

                        {/* Additional Info */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '24px',
                            marginTop: '24px',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280'
                                }}>
                                    Certified Hallmarked
                                </span>
                            </div>
                            <div style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb'
                            }}></div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <ImageIcon size={16} color="#b8860b" />
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280'
                                }}>
                                    Detailed Product Views
                                </span>
                            </div>
                            <div style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#e5e7eb'
                            }}></div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    backgroundColor: '#b8860b',
                                    opacity: 0.7
                                }}></div>
                                <span style={{
                                    fontSize: '14px',
                                    color: '#6b7280'
                                }}>
                                    Free Shipping Available
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
                
                /* Responsive adjustments */
                @media (max-width: 1024px) {
                    .responsive-title {
                        font-size: 40px !important;
                    }
                    
                    .responsive-grid {
                        gap: 24px !important;
                    }
                }
                
                @media (max-width: 768px) {
                    .responsive-title {
                        font-size: 32px !important;
                    }
                    
                    .responsive-grid {
                        gap: 20px !important;
                        grid-template-columns: repeat(2, 1fr) !important;
                    }
                }
                
                @media (max-width: 640px) {
                    .responsive-title {
                        font-size: 28px !important;
                    }
                    
                    .responsive-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px !important;
                    }
                    
                    .image-stats {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                    
                    .info-row {
                        flex-direction: column !important;
                        gap: 12px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default RelatedProducts;