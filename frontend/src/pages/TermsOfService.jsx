import React from 'react';
import Title from '../components/common/Title';

const TermsOfService = () => {
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
    };

    // Section hover style (will be applied via onMouseEnter/Leave)
    const sectionHoverStyle = {
        ...sectionStyle,
        boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        transform: "translateY(-4px)",
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

    // Responsive styles (applied via media queries in style tag)
    const responsiveStyles = `
        @media (max-width: 768px) {
            .terms-container {
                padding: 40px 20px !important;
            }
            .terms-section {
                padding: 20px 24px !important;
            }
            .terms-heading {
                font-size: 18px !important;
            }
            .terms-text {
                font-size: 14px !important;
            }
        }
        
        @media (max-width: 480px) {
            .terms-container {
                padding: 30px 16px !important;
            }
            .terms-section {
                padding: 16px 20px !important;
            }
            .terms-heading {
                font-size: 16px !important;
                margin-bottom: 12px !important;
            }
            .terms-text {
                font-size: 13px !important;
                line-height: 1.6 !important;
            }
        }
        
        @media (min-width: 1400px) {
            .terms-container {
                padding: 60px 12vw !important;
            }
            .terms-section {
                padding: 32px 40px !important;
            }
        }
        
        .terms-section {
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .terms-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
            transform: translateX(-100%);
            transition: transform 0.5s ease;
        }
        
        .terms-section:hover::before {
            transform: translateX(0);
        }
        
        .terms-section:hover {
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.15);
            transform: translateY(-4px);
            border-color: rgba(102, 126, 234, 0.3);
        }
    `;

    return (
        <>
            <style>
                {responsiveStyles}
            </style>

            <div
                className="terms-container"
                style={containerStyle}
            >
                {/* Title Section */}
                <div style={titleWrapperStyle}>
                    <div style={{
                        position: "absolute",
                        top: "-10px",
                        left: "-10px",
                        width: "40px",
                        height: "40px",
                        background: "rgba(102, 126, 234, 0.1)",
                        borderRadius: "50%",
                        zIndex: "0",
                    }} />
                    <div style={{
                        position: "relative",
                        zIndex: "1",
                    }}>
                        <Title text1={'TERMS OF'} text2={'SERVICE'} />
                    </div>
                </div>

                {/* Content Sections */}
                <div style={contentWrapperStyle}>
                    {/* Introduction */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            1. Introduction
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            Welcome to <strong style={{ color: "#667eea" }}>JewelNest</strong>. By accessing our website, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                        </p>
                    </section>

                    {/* Use License */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            2. Use License
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            Permission is granted to temporarily download one copy of the materials (information or software) on JewelNest's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul style={{
                            ...textStyle,
                            marginTop: "12px",
                            paddingLeft: "24px",
                            listStyleType: "disc",
                        }}>
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose</li>
                            <li>Attempt to decompile or reverse engineer any software</li>
                            <li>Remove any copyright or other proprietary notations</li>
                            <li>Transfer the materials to another person</li>
                        </ul>
                    </section>

                    {/* Disclaimer */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            3. Disclaimer
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            The materials on JewelNest's website are provided on an <strong style={{ color: "#667eea" }}>'as is'</strong> basis. JewelNest makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                        </p>
                    </section>

                    {/* Limitations */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            4. Limitations
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            In no event shall JewelNest or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on JewelNest's website, even if JewelNest or a JewelNest authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    {/* Revisions and Errata */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            5. Revisions and Errata
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            The materials appearing on JewelNest's website could include technical, typographical, or photographic errors. JewelNest does not warrant that any of the materials on its website are accurate, complete, or current. JewelNest may make changes to the materials contained on its website at any time without notice.
                        </p>
                    </section>

                    {/* Links */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            6. Links
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            JewelNest has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by JewelNest of the site. Use of any such linked website is at the user's own risk.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section
                        className="terms-section"
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
                        <h3 className="terms-heading" style={headingStyle}>
                            <span style={decorativeStyle} />
                            7. Governing Law
                        </h3>
                        <p className="terms-text" style={textStyle}>
                            These terms and conditions are governed by and construed in accordance with the laws of <strong style={{ color: "#667eea" }}>West Bengal, India</strong> and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location. Any disputes arising under these Terms shall be resolved in accordance with the laws of India.
                        </p>
                    </section>

                    {/* Last Updated Note */}
                    <div style={{
                        marginTop: "20px",
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "14px",
                        fontStyle: "italic",
                        padding: "20px",
                        borderTop: "1px dashed #e2e8f0",
                    }}>
                        Last Updated: {new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TermsOfService;