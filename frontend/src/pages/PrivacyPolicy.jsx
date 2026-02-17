import React from 'react';
import Title from '../components/common/Title';

const PrivacyPolicy = () => {
    // Main container style
    const containerStyle = {
        borderTop: "1px solid #e5e7eb",
        padding: "56px 5vw",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ffffff 0%, #fafbff 100%)",
    };

    // Title wrapper style
    const titleWrapperStyle = {
        fontSize: "24px",
        marginBottom: "40px",
        position: "relative",
        display: "inline-block",
    };

    // Content wrapper style
    const contentWrapperStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px",
    };

    // Section style
    const sectionStyle = {
        background: "white",
        borderRadius: "16px",
        padding: "28px 32px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
    };

    // Heading style
    const headingStyle = {
        fontSize: "20px",
        fontWeight: "700",
        color: "#1a202c",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "2px solid #667eea",
        paddingBottom: "12px",
        position: "relative",
    };

    // Text style
    const textStyle = {
        color: "#4a5568",
        fontSize: "15px",
        lineHeight: "1.8",
        fontWeight: "400",
    };

    // Decorative element style
    const decorativeStyle = {
        width: "4px",
        height: "24px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "4px",
        marginRight: "8px",
    };

    // Privacy badge style
    const badgeStyle = {
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(102, 126, 234, 0.1)",
        color: "#667eea",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        letterSpacing: "0.5px",
    };

    // Responsive styles
    const responsiveStyles = `
        @media (max-width: 768px) {
            .privacy-container {
                padding: 40px 20px !important;
            }
            .privacy-section {
                padding: 20px 24px !important;
            }
            .privacy-heading {
                font-size: 18px !important;
            }
            .privacy-text {
                font-size: 14px !important;
            }
            .privacy-badge {
                top: 12px !important;
                right: 12px !important;
                padding: 3px 10px !important;
                font-size: 11px !important;
            }
        }
        
        @media (max-width: 480px) {
            .privacy-container {
                padding: 30px 16px !important;
            }
            .privacy-section {
                padding: 16px 20px !important;
            }
            .privacy-heading {
                font-size: 16px !important;
                margin-bottom: 12px !important;
            }
            .privacy-text {
                font-size: 13px !important;
                line-height: 1.6 !important;
            }
            .privacy-badge {
                top: 8px !important;
                right: 8px !important;
                padding: 2px 8px !important;
                font-size: 10px !important;
            }
        }
        
        @media (min-width: 1400px) {
            .privacy-container {
                padding: 60px 12vw !important;
            }
            .privacy-section {
                padding: 32px 40px !important;
            }
        }
        
        .privacy-section {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .privacy-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #ff6b6b);
            transform: translateX(-100%);
            transition: transform 0.5s ease;
        }
        
        .privacy-section:hover::before {
            transform: translateX(0);
        }
        
        .privacy-section:hover {
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
            transform: translateY(-4px);
            border-color: rgba(102, 126, 234, 0.3);
        }
        
        .shield-icon {
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.7;
            }
        }
    `;

    return (
        <>
            <style>
                {responsiveStyles}
            </style>

            <div
                className="privacy-container"
                style={containerStyle}
            >
                {/* Decorative background elements */}
                <div style={{
                    position: "fixed",
                    top: "0",
                    right: "0",
                    width: "300px",
                    height: "300px",
                    background: "radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, rgba(102, 126, 234, 0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: "0",
                }} />

                <div style={{
                    position: "fixed",
                    bottom: "0",
                    left: "0",
                    width: "400px",
                    height: "400px",
                    background: "radial-gradient(circle, rgba(255, 107, 107, 0.05) 0%, rgba(255, 107, 107, 0) 70%)",
                    borderRadius: "50%",
                    pointerEvents: "none",
                    zIndex: "0",
                }} />

                {/* Title Section */}
                <div style={{
                    ...titleWrapperStyle,
                    position: "relative",
                    zIndex: "1",
                }}>
                    <div style={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        width: "50px",
                        height: "50px",
                        background: "rgba(102, 126, 234, 0.08)",
                        borderRadius: "50%",
                        zIndex: "0",
                        animation: "pulse 3s infinite",
                    }} />
                    <div style={{
                        position: "relative",
                        zIndex: "1",
                    }}>
                        <Title text1={'PRIVACY'} text2={'POLICY'} />
                    </div>
                    <div style={{
                        marginTop: "8px",
                        fontSize: "14px",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}>
                        <span className="shield-icon" style={{ fontSize: "16px" }}>🛡️</span>
                        Your data is protected with us
                    </div>
                </div>

                {/* Content Sections */}
                <div style={contentWrapperStyle}>
                    {/* Information We Collect */}
                    <section
                        className="privacy-section"
                        style={sectionStyle}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>ESSENTIAL</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            1. Information We Collect
                        </h3>
                        <p className="privacy-text" style={textStyle}>
                            We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This information may include:
                        </p>
                        <ul style={{
                            ...textStyle,
                            marginTop: "12px",
                            paddingLeft: "24px",
                            listStyleType: "none",
                        }}>
                            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#667eea" }}>✓</span> Name and contact information
                            </li>
                            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#667eea" }}>✓</span> Email address
                            </li>
                            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#667eea" }}>✓</span> Shipping address
                            </li>
                            <li style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "#667eea" }}>✓</span> Payment information (processed securely)
                            </li>
                        </ul>
                    </section>

                    {/* How We Use Your Information */}
                    <section
                        className="privacy-section"
                        style={sectionStyle}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>USAGE</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            2. How We Use Your Information
                        </h3>
                        <p className="privacy-text" style={textStyle}>
                            We use the information we collect to process your orders, communicate with you, significantly improve our services, and personalize your shopping experience. This includes:
                        </p>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "12px",
                            marginTop: "16px",
                        }}>
                            {[
                                "Order Processing",
                                "Customer Support",
                                "Service Improvement",
                                "Personalization"
                            ].map((item, index) => (
                                <div key={index} style={{
                                    background: "rgba(102, 126, 234, 0.05)",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    textAlign: "center",
                                    fontSize: "14px",
                                    color: "#4a5568",
                                    border: "1px solid rgba(102, 126, 234, 0.1)",
                                }}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section
                        className="privacy-section"
                        style={sectionStyle}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>SHARING</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            3. Information Sharing
                        </h3>
                        <p className="privacy-text" style={textStyle}>
                            <strong style={{ color: "#10b981" }}>We do not sell or rent your personal information to third parties.</strong> We may share your information with service providers who perform services on our behalf, such as:
                        </p>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                            marginTop: "16px",
                        }}>
                            {["Payment Processing", "Shipping Partners", "Customer Support", "Analytics"].map((item, index) => (
                                <span key={index} style={{
                                    background: "#f1f5f9",
                                    padding: "6px 14px",
                                    borderRadius: "20px",
                                    fontSize: "13px",
                                    color: "#475569",
                                }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Security */}
                    <section
                        className="privacy-section"
                        style={{
                            ...sectionStyle,
                            background: "linear-gradient(135deg, #ffffff 0%, #f8faff 100%)",
                        }}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>PROTECTION</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            4. Security Measures
                        </h3>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            flexWrap: "wrap",
                        }}>
                            <div style={{
                                width: "60px",
                                height: "60px",
                                background: "rgba(102, 126, 234, 0.1)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "28px",
                            }}>
                                🔒
                            </div>
                            <p className="privacy-text" style={{ ...textStyle, flex: "1" }}>
                                We take reasonable measures to help protect your personal information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction using industry-standard encryption and security protocols.
                            </p>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section
                        className="privacy-section"
                        style={sectionStyle}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>TRACKING</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            5. Cookies
                        </h3>
                        <p className="privacy-text" style={textStyle}>
                            We use cookies to help us improve your access to our site and identify repeat visitors. Furthermore, our cookies enhance the user experience by tracking and targeting the interests of our users. You can control cookie settings through your browser preferences.
                        </p>
                    </section>

                    {/* Changes to This Policy */}
                    <section
                        className="privacy-section"
                        style={sectionStyle}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                                transform: "translateY(-4px)",
                                borderColor: "rgba(102, 126, 234, 0.3)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                transform: "translateY(0)",
                                borderColor: "rgba(102, 126, 234, 0.1)",
                            });
                        }}
                    >
                        <span className="privacy-badge" style={badgeStyle}>UPDATES</span>
                        <h3 className="privacy-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            6. Changes to This Policy
                        </h3>
                        <p className="privacy-text" style={textStyle}>
                            We may update this privacy policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy and, in some cases, we may provide you with additional notice (such as adding a statement to our homepage or sending you an email notification).
                        </p>
                    </section>

                    {/* Contact Us */}
                    <section
                        className="privacy-section"
                        style={{
                            ...sectionStyle,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            border: "none",
                        }}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 30px 50px rgba(102, 126, 234, 0.3)",
                                transform: "translateY(-4px)",
                            });
                        }}
                        onMouseLeave={(e) => {
                            Object.assign(e.currentTarget.style, {
                                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.2)",
                                transform: "translateY(0)",
                            });
                        }}
                    >
                        <h3 className="privacy-heading" style={{
                            ...headingStyle,
                            color: "white",
                            borderBottomColor: "rgba(255, 255, 255, 0.3)",
                        }}>
                            <span style={{
                                ...decorativeStyle,
                                background: "white",
                            }} />
                            7. Contact Us
                        </h3>
                        <p className="privacy-text" style={{
                            ...textStyle,
                            color: "rgba(255, 255, 255, 0.9)",
                        }}>
                            If you have any questions about this Privacy Policy, please contact us at:
                        </p>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            marginTop: "16px",
                            flexWrap: "wrap",
                        }}>
                            <a
                                href="mailto:jewelnest86@gmail.com"
                                style={{
                                    background: "white",
                                    color: "#667eea",
                                    padding: "12px 28px",
                                    borderRadius: "30px",
                                    textDecoration: "none",
                                    fontWeight: "600",
                                    fontSize: "16px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    transition: "all 0.3s ease",
                                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
                                }}
                            >
                                📧 jewelnest86@gmail.com
                            </a>
                            <span style={{
                                color: "white",
                                fontSize: "14px",
                            }}>
                                We typically respond within 24 hours
                            </span>
                        </div>
                    </section>

                    {/* Footer Note */}
                    <div style={{
                        marginTop: "20px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                        padding: "20px",
                        borderTop: "1px dashed #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "16px",
                        flexWrap: "wrap",
                    }}>
                        <span>🔐 SSL Secure Connection</span>
                        <span>•</span>
                        <span>📜 GDPR Compliant</span>
                        <span>•</span>
                        <span>Last Updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrivacyPolicy;