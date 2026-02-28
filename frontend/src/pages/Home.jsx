import React from 'react';
import Hero from '../components/Hero';
import LatestCollection from '../components/products/LatestCollection.jsx';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            overflowX: 'hidden',
            maxWidth: '1400px',
            margin: '0 auto',
            position: 'relative'
        }}>
            {/* 1. Hero Section */}
            <Hero />

            {/* 2. Latest Collection Section */}
            {/* zIndex and pointer-events ensure clicks reach the product buttons */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                backgroundColor: '#f5f2e8',
                pointerEvents: 'auto'
            }}>
                <LatestCollection />
            </div>

            {/* 3. Call to Action (CTA) Section */}
            <section style={{
                padding: '100px 20px',
                marginTop: '40px',
                background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                zIndex: 5
            }}>
                {/* Decorative Background - pointer-events: none is MUST here */}
                <div style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(184, 134, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(184, 134, 11, 0.15) 0%, transparent 50%)',
                    zIndex: 1,
                    pointerEvents: 'none'
                }}></div>

                {/* Main Content Container */}
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 2,
                    pointerEvents: 'auto'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(32px, 5vw, 48px)', // Responsive font size
                        fontWeight: '300',
                        marginBottom: '24px',
                        background: 'linear-gradient(45deg, #fbbf24, #ffffff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '1px'
                    }}>
                        Find Your Perfect Piece
                    </h2>

                    <p style={{
                        fontSize: '18px',
                        color: '#cbd5e0',
                        lineHeight: '1.8',
                        marginBottom: '40px',
                        fontWeight: '300',
                        maxWidth: '650px',
                        margin: '0 auto 48px'
                    }}>
                        Explore our exclusive collection of handcrafted jewelry that tells your unique story.
                        Each piece is a masterpiece waiting to become part of your journey.
                    </p>

                    {/* Buttons Container */}
                    <div style={{
                        display: 'flex',
                        gap: '20px',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        <Link
                            to="/collection"
                            style={{
                                background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                color: 'white',
                                padding: '16px 36px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                letterSpacing: '1px',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                border: 'none',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 10px 20px rgba(184, 134, 11, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
                            }}
                        >
                            <span>Shop Collections</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <Link
                            to="/contact"
                            style={{
                                background: 'transparent',
                                color: '#fbbf24',
                                padding: '16px 36px',
                                borderRadius: '30px',
                                textDecoration: 'none',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: '2px solid #fbbf24',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fbbf24';
                                e.currentTarget.style.color = '#1a202c';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = '#fbbf24';
                            }}
                        >
                            <span>Consultation</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                            </svg>
                        </Link>
                    </div>

                    {/* Trust Indicators Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: '30px',
                        marginTop: '80px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '50px'
                    }}>
                        {[
                            { label: 'High Quality', value: '100%' },
                            { label: 'Happy Customers', value: '5K+' },
                            { label: 'Experience', value: '15 Yrs' },
                            { label: 'Design Awards', value: '25+' }
                        ].map((item, index) => (
                            <div key={index}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>{item.value}</div>
                                <div style={{ fontSize: '12px', color: '#cbd5e0', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;