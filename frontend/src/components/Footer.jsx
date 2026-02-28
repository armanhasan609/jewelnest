import {
    Facebook, Instagram, Twitter, Youtube, Share2,
    Mail, Phone, MapPin, Heart, Gem, Shield, Truck,
    CreditCard, Headphones, Clock, Award, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Footer = () => {
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isHovered, setIsHovered] = useState({});
    const [currentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const trustBadges = [
        {
            icon: <Shield size={24} />,
            title: 'Secure Payment',
            sub: '256-bit SSL Encryption',
            color: '#10b981'
        },
        {
            icon: <Truck size={24} />,
            title: 'Free Shipping',
            sub: 'On orders above ₹499',
            color: '#3b82f6'
        },
        {
            icon: <Gem size={24} />,
            title: 'High Quality',
            sub: 'Certified Pure Metals',
            color: '#b8860b'
        },
        {
            icon: <Headphones size={24} />,
            title: '24/7 Support',
            sub: 'Dedicated Assistance',
            color: '#06b6d4'
        }
    ];

    const categories = [
        { name: 'Necklaces', count: '48+' },
        { name: 'Rings', count: '36+' },
        { name: 'Earrings', count: '42+' },
        { name: 'Bracelets', count: '24+' },
        { name: 'Anklets', count: '18+' },
        { name: 'Pendants', count: '30+' }
    ];

    const customerService = [
        { name: 'Contact Us', path: '/contact' },
        { name: 'Shipping Policy', path: '/shipping' },
        { name: 'Return & Exchange', path: '/returns' },
        { name: 'Size Guide', path: '/size-guide' },
        { name: 'Care Instructions', path: '/care' },
        { name: 'FAQs', path: '/faq' }
    ];

    const socialLinks = [
        { Icon: Instagram, color: '#E4405F', label: 'Instagram' },
        { Icon: Facebook, color: '#1877F2', label: 'Facebook' },
        { Icon: Twitter, color: '#1DA1F2', label: 'Twitter' },
        { Icon: Share2, color: '#E60023', label: 'Pinterest' },
        { Icon: Youtube, color: '#FF0000', label: 'YouTube' }
    ];

    const contactInfo = [
        { Icon: MapPin, text: 'JewelNest, Banipur, Murshidabad, West Bengal - 742235', color: '#8b5cf6' },
        { Icon: Phone, text: '+91 86090 30343 (Mon-Sun, 10AM-8PM)', color: '#3b82f6' },
        { Icon: Mail, text: 'jewelnest86@gmail.com', color: '#ec4899' },
        { Icon: Clock, text: 'Customer Support: 24/7', color: '#10b981' }
    ];

    return (
        <footer style={{
            backgroundColor: '#fcfaf6',
            position: 'relative',
            overflow: 'hidden',
            marginTop: '120px'
        }}>
            {/* Premium Top Border */}
            <div style={{
                height: '8px',
                background: 'linear-gradient(90deg, #fbbf24, #b8860b, #fbbf24)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '8px',
                    background: 'linear-gradient(90deg, #fbbf24, #b8860b)',
                    borderRadius: '4px',
                    boxShadow: '0 4px 20px rgba(184, 134, 11, 0.4)'
                }}></div>
            </div>

            {/* Trust Badges Section */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '60px 40px 40px',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '24px',
                    marginBottom: '20px'
                }}>
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                        <h3 style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#b8860b',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            marginBottom: '12px'
                        }}>
                            Why Choose Us
                        </h3>
                        <h2 style={{
                            fontSize: isMobile ? '32px' : '40px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '20px',
                            fontFamily: "'Playfair Display', serif",
                            lineHeight: '1.2'
                        }}>
                            Exclusive Experience,<br />Uncompromised Quality
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            color: '#6b7280',
                            lineHeight: '1.7',
                            maxWidth: '500px'
                        }}>
                            We are committed to providing exceptional craftsmanship, ethical sourcing, and unparalleled customer service.
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'center' : 'flex-end'
                    }}>
                        <button onClick={() => navigate('/collection')} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'linear-gradient(135deg, #b8860b 0%, #fbbf24 100%)',
                            color: 'white',
                            padding: '16px 32px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 8px 32px rgba(184, 134, 11, 0.3)'
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 16px 48px rgba(184, 134, 11, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(184, 134, 11, 0.3)';
                            }}>
                            Start Shopping
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                    gap: '20px',
                    marginTop: '40px',
                    alignItems: 'center'
                }}>
                    {trustBadges.map((badge, index) => (
                        <div
                            key={index}
                            style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px 20px',
                                textAlign: 'center',
                                transition: 'all 0.3s ease',
                                border: '2px solid transparent',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.borderColor = badge.color;
                                e.currentTarget.style.boxShadow = `0 12px 32px ${badge.color}20`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.borderColor = 'transparent';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                background: `${badge.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: badge.color,
                                margin: '0 auto 16px',
                                transition: 'transform 0.3s ease'
                            }}>
                                {badge.icon}
                            </div>
                            <h4 style={{
                                fontSize: '15px',
                                fontWeight: '700',
                                color: '#1a202c',
                                marginBottom: '6px'
                            }}>
                                {badge.title}
                            </h4>
                            <p style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                lineHeight: '1.4'
                            }}>
                                {badge.sub}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Footer Content */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '80px 40px 60px',
                background: 'linear-gradient(to bottom, transparent, rgba(184, 134, 11, 0.02))',
                borderRadius: '40px 40px 0 0',
                position: 'relative'
            }}>
                {/* Decorative background pattern */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(184, 134, 11, 0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                    gap: '40px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Brand Column */}
                    <div style={{ gridColumn: isMobile ? '1' : 'span 2' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Gem size={24} color="white" />
                            </div>
                            <h2 style={{
                                fontSize: '32px',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: "'Playfair Display', serif"
                            }}>
                                JewelNest
                            </h2>
                        </div>

                        <p style={{
                            fontSize: '15px',
                            color: '#6b7280',
                            lineHeight: '1.7',
                            marginBottom: '32px',
                            maxWidth: '300px'
                        }}>
                            Crafting timeless elegance with ethically sourced, high-quality jewelry that tells your unique story.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    aria-label={social.label}
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: social.color,
                                        border: '2px solid #f3f4f6',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.background = social.color;
                                        e.currentTarget.style.color = 'white';
                                        e.currentTarget.style.borderColor = social.color;
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${social.color}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.background = 'white';
                                        e.currentTarget.style.color = social.color;
                                        e.currentTarget.style.borderColor = '#f3f4f6';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <social.Icon size={20} />
                                </a>
                            ))}
                        </div>

                    </div>

                    {/* Categories */}
                    <div>
                        <h4 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1a202c',
                            marginBottom: '24px',
                            position: 'relative',
                            paddingBottom: '12px'
                        }}>
                            Collections
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                width: '32px',
                                height: '3px',
                                background: 'linear-gradient(90deg, #b8860b, #fbbf24)',
                                borderRadius: '2px'
                            }}></div>
                        </h4>
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '16px',
                                    padding: '12px 16px',
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.borderColor = '#fbbf24';
                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(184, 134, 11, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.borderColor = '#f3f4f6';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '14px', color: '#1a202c', fontWeight: '500' }}>
                                    {category.name}
                                </span>
                                <span style={{
                                    fontSize: '12px',
                                    color: '#b8860b',
                                    fontWeight: '600',
                                    background: '#fef3c7',
                                    padding: '4px 10px',
                                    borderRadius: '20px'
                                }}>
                                    {category.count}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1a202c',
                            marginBottom: '24px',
                            position: 'relative',
                            paddingBottom: '12px'
                        }}>
                            Contact Us
                            <div style={{
                                position: 'absolute',
                                bottom: '0',
                                left: '0',
                                width: '32px',
                                height: '3px',
                                background: 'linear-gradient(90deg, #b8860b, #fbbf24)',
                                borderRadius: '2px'
                            }}></div>
                        </h4>

                        {contactInfo.map((info, index) => (
                            <div
                                key={index}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    marginBottom: '24px',
                                    padding: '20px',
                                    background: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #f3f4f6',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `${info.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: info.color,
                                    flexShrink: 0
                                }}>
                                    <info.Icon size={20} />
                                </div>
                                <div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1a202c',
                                        marginBottom: '4px'
                                    }}>
                                        {info.Icon.name === 'Phone' ? 'Call Us' :
                                            info.Icon.name === 'Mail' ? 'Email' :
                                                info.Icon.name === 'Clock' ? 'Support Hours' : 'Visit Us'}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        lineHeight: '1.5'
                                    }}>
                                        {info.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Methods & Bottom Section */}
                <div style={{
                    marginTop: '60px',
                    paddingTop: '40px',
                    borderTop: '2px solid #f3f4f6'
                }}>
                    {/* Copyright Section */}
                    <div style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        paddingTop: '32px',
                        borderTop: '1px dashed #e5e7eb'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            <span style={{
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                © {currentYear} JewelNest. All rights reserved.
                            </span>
                            <div style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#d1d5db'
                            }}></div>
                            <Link to="/privacy" style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                textDecoration: 'none'
                            }}>
                                Privacy Policy
                            </Link>
                            <div style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#d1d5db'
                            }}></div>
                            <Link to="/terms" style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                textDecoration: 'none'
                            }}>
                                Terms of Service
                            </Link>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <span style={{
                                fontSize: '14px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Heart size={16} style={{ color: '#ef4444', fill: '#ef4444' }} />
                                Made with passion in India
                            </span>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #fbbf24 0%, #b8860b 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Gem size={16} color="white" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                /* Smooth scrolling for anchor links */
                html {
                    scroll-behavior: smooth;
                }
            `}</style>
        </footer>
    );
};

export default Footer;