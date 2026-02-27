import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, ArrowRight, Gem, Crown, Shield } from 'lucide-react';

const Hero = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [scrollProgress, setScrollProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());
    const canvasRef = useRef(null);

    const heroImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3CradialGradient id='g2' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23FFD700;stop-opacity:0.3'/%3E%3Cstop offset='100%25' style='stop-color:%23B8860B;stop-opacity:0.1'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g2)'/%3E%3Ccircle cx='600' cy='400' r='300' fill='url(%23g2)'/%3E%3C/svg%3E";

    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 20;
            const y = (e.clientY / window.innerHeight - 0.5) * 20;

            setMousePosition({
                x: x,
                y: y
            });
        };

        const handleScroll = () => {
            const scrollPx = window.scrollY;
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const scrolled = Math.min((scrollPx / (docHeight - winHeight)) * 100, 100);
            setScrollProgress(scrolled);
        };

        const updateTime = () => {
            setCurrentTime(new Date());
        };

        const timeInterval = setInterval(updateTime, 1000);

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            clearInterval(timeInterval);
        };
    }, []);

    // Time-based dynamic orb particles
    const orbParticles = Array.from({ length: 25 }).map((_, i) => ({
        id: i,
        size: Math.random() * 80 + 30,
        x: Math.random() * 100,
        y: Math.random() * 100,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.2 + 0.05,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2
    }));

    // Floating diamonds
    const floatingDiamonds = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        size: Math.random() * 30 + 15,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        speed: Math.random() * 0.5 + 0.2,
        delay: Math.random() * 5
    }));

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return (
        <div
            className="hero-root"
            style={{
                position: 'relative',
                width: '100%',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 30%, #16213e 70%, #0c0c1a 100%)',
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif"
            }}
        >
            {/* Animated background grid with parallax */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `
                    linear-gradient(90deg, rgba(184, 134, 11, 0.1) 1px, transparent 1px),
                    linear-gradient(rgba(184, 134, 11, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                backgroundPosition: `${mousePosition.x * 0.5}px ${mousePosition.y * 0.5}px`,
                opacity: 0.4
            }} />

            {/* Animated gradient overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(184, 134, 11, 0.15) 0%, transparent 50%)',
                opacity: 0.6,
                transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`
            }} />

            {/* Dynamic orb particles */}
            {orbParticles.map((orb) => {
                const pulse = Math.sin(Date.now() * orb.pulseSpeed + orb.pulsePhase) * 0.1 + 1;
                return (
                    <div
                        key={orb.id}
                        style={{
                            position: 'absolute',
                            width: `${orb.size * pulse}px`,
                            height: `${orb.size * pulse}px`,
                            background: 'radial-gradient(circle at 30% 30%, rgba(255, 215, 0, 0.25), transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(15px)',
                            top: `${orb.y}%`,
                            left: `${orb.x}%`,
                            opacity: orb.opacity,
                            transform: `translate(${Math.sin(Date.now() * orb.speedX * 0.001) * 20}px, 
                                           ${Math.cos(Date.now() * orb.speedY * 0.001) * 20}px)`,
                            transition: 'transform 0.3s ease-out'
                        }}
                    />
                );
            })}

            {/* Floating diamonds with rotation */}
            {floatingDiamonds.map((diamond) => (
                <div
                    key={`diamond-${diamond.id}`}
                    style={{
                        position: 'absolute',
                        width: `${diamond.size}px`,
                        height: `${diamond.size}px`,
                        opacity: 0.3,
                        transform: `
                            translate(${diamond.x}vw, ${diamond.y}vh)
                            rotate(${diamond.rotation + Date.now() * diamond.speed * 0.01}deg)
                        `,
                        transition: 'transform 0.5s ease-out',
                        animation: `float ${3 + diamond.delay}s ease-in-out infinite`
                    }}
                >
                    <Gem
                        size={diamond.size}
                        color="rgba(255, 215, 0, 0.3)"
                        strokeWidth={0.5}
                    />
                </div>
            ))}

            {/* Main content container */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '120px 20px 60px', // Adjusted padding for mobile top clearage
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                width: '100%', // Ensure container takes full width
                boxSizing: 'border-box' // Prevent padding from causing overflow
            }}>
                {/* Time display */}
                <div style={{
                    position: 'absolute',
                    top: '30px',
                    right: '30px',
                    color: 'rgba(255, 215, 0, 0.7)',
                    fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: '2px',
                    display: 'flex', // Ensure visibility logic remains simple
                    zIndex: 20 // Ensure it stays on top
                }}>
                    {formattedTime}
                </div>

                {/* Collection badge */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center', // Fix for smaller screens
                    gap: '12px',
                    background: 'linear-gradient(45deg, rgba(184, 134, 11, 0.3), rgba(251, 191, 36, 0.15))',
                    backdropFilter: 'blur(10px)',
                    color: 'rgba(255, 215, 0, 0.95)',
                    padding: '12px 24px', // Slightly reduced padding for mobile
                    borderRadius: '100px',
                    fontSize: 'clamp(0.6rem, 2vw, 0.9rem)', // Adjusted lower clamp bound
                    fontWeight: '700',
                    letterSpacing: '3px', // Reduced spacing slightly for mobile fit
                    textTransform: 'uppercase',
                    marginBottom: 'clamp(30px, 5vh, 60px)', // Responsive margin
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    animation: 'pulse 2s ease-in-out infinite',
                    transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
                    maxWidth: '90vw', // Prevent overflow on very small screens
                    flexWrap: 'wrap' // Allow wrapping on very small screens
                }}>
                    <Sparkles size={18} style={{ flexShrink: 0 }} />
                    <span>EST. 2002 • LEGACY COLLECTION</span>
                </div>

                {/* Main headline */}
                <div style={{
                    marginBottom: '40px',
                    transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
                    width: '100%' // Ensure headline container doesn't overflow
                }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 12rem)', // Adjusted minimum size
                        fontWeight: '300',
                        lineHeight: '0.9',
                        marginBottom: '24px',
                        letterSpacing: '-2px',
                        wordBreak: 'break-word' // Prevent long words breaking layout
                    }}>
                        <span style={{
                            color: 'transparent',
                            background: 'linear-gradient(45deg, #fff 30%, #fbbf24 70%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            display: 'block'
                        }}>
                            TIMELESS
                        </span>
                        <span style={{
                            color: 'transparent',
                            background: 'linear-gradient(45deg, #fbbf24 30%, #b8860b 70%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            fontWeight: '800',
                            display: 'block',
                            marginTop: 'clamp(-10px, -2vw, -20px)' // Responsive overlap
                        }}>
                            ELEGANCE
                        </span>
                    </h1>

                    {/* Subtitle with icons */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 'clamp(15px, 3vw, 30px)', // Responsive gap
                        marginTop: '40px',
                        flexWrap: 'wrap',
                        width: '100%'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1.1rem'
                        }}>
                            <Shield size={20} color="#fbbf24" />
                            <span>Certified Excellence</span>
                        </div>
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#fbbf24'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1.1rem'
                        }}>
                            <Crown size={20} color="#fbbf24" />
                            <span>Royal Heritage</span>
                        </div>
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#fbbf24'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '1.1rem'
                        }}>
                            <Gem size={20} color="#fbbf24" />
                            <span>Master Craftsmanship</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p style={{
                    fontSize: 'clamp(1rem, 3vw, 1.8rem)', // Adjusted low end for mobile readability
                    color: 'rgba(255,255,255,0.85)',
                    marginBottom: '60px',
                    maxWidth: '800px',
                    width: '100%', // Ensure it wraps correctly
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    padding: '0 10px', // Edge padding
                    transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`
                }}>
                    "Where each piece tells a story of <span style={{ color: '#fbbf24' }}>centuries-old craftsmanship</span>,
                    blending tradition with contemporary luxury."
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => window.location.href = '/collection'}
                    style={{
                        background: 'linear-gradient(45deg, #0a0a0a, #1a1a2e)',
                        color: '#fbbf24',
                        padding: 'clamp(16px, 2vh, 24px) clamp(32px, 4vw, 64px)', // Responsive padding
                        borderRadius: '100px',
                        border: '2px solid rgba(251, 191, 36, 0.4)',
                        fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center', // Center text for mobile
                        gap: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        letterSpacing: '1px',
                        maxWidth: '90vw', // Prevent button changing screen width
                        transform: `translate(${mousePosition.x * 0.15}px, ${mousePosition.y * 0.15}px)`
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, rgba(251, 191, 36, 0.1), rgba(184, 134, 11, 0.05))';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.8)';
                        e.target.style.boxShadow = '0 0 30px rgba(251, 191, 36, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = 'linear-gradient(45deg, #0a0a0a, #1a1a2e)';
                        e.target.style.borderColor = 'rgba(251, 191, 36, 0.4)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    <span style={{
                        position: 'absolute',
                        top: '0',
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                        animation: 'shimmer 2s infinite'
                    }} />
                    EXPLORE THE COLLECTION
                    <ArrowRight size={28} style={{ transition: 'transform 0.3s ease' }} />
                </button>

                {/* Stats bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'clamp(30px, 5vw, 60px)',
                    marginTop: '80px',
                    flexWrap: 'wrap',
                    width: '100%',
                    paddingBottom: '40px' // Space for scroll indicator
                }}>
                    {[
                        { value: '24+', label: 'Years of Excellence' },
                        { value: '5,000+', label: 'Masterpieces Created' },
                        { value: '∞', label: 'Stories Told' }
                    ].map((stat, index) => (
                        <div
                            key={index}
                            style={{
                                textAlign: 'center',
                                opacity: 0.9,
                                transform: `translateY(${Math.sin(Date.now() * 0.001 + index) * 5}px)`,
                                transition: 'transform 0.3s ease',
                                flex: '1 1 140px', // Flex basis for improved wrapping
                                maxWidth: '200px'
                            }}
                        >
                            <div style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: '300',
                                color: '#fbbf24',
                                marginBottom: '8px'
                            }}>
                                {stat.value}
                            </div>
                            <div style={{
                                fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                                color: 'rgba(255,255,255,0.7)',
                                letterSpacing: '1px'
                            }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll progress indicator */}
            <div style={{
                position: 'fixed',
                bottom: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'clamp(200px, 50vw, 400px)',
                height: '3px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                zIndex: 100
            }}>
                <div style={{
                    width: `${scrollProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #fbbf24, #b8860b)',
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                }} />
            </div>

            {/* Scroll hint */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'rgba(255, 215, 0, 0.5)',
                fontSize: '0.9rem',
                letterSpacing: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'bounce 2s infinite'
            }}>
                <span>SCROLL</span>
                <ArrowRight size={16} style={{ transform: 'rotate(90deg)' }} />
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.05); }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(10px); }
                }
                
                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .hero-root {
                        height: auto !important; /* Allow growing naturally on mobile */
                        min-height: 100vh;
                    }

                    /* Disable hover effects on touch devices for performance */
                    button:hover {
                         transform: none !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .hero-root {
                        padding: 0 !important;
                    }
                    
                    /* Adjust vertical rhythm on mobile */
                    h1 {
                        margin-bottom: 30px !important;
                    }
                    
                    /* Stack subtitle items vertically */
                    div[style*="display: flex"] > div[style*="width: 4px"] {
                        display: none; /* Hide separator dots */
                    }
                    
                    /* Optimize animations */
                    * {
                        animation-play-state: running;
                    }
                }
            `}</style>
        </div>
    );
};

export default Hero;