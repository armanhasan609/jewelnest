import React from 'react';
import Title from '../components/common/Title';
import ContactForm from '../components/ContactForm';
import { Mail, Phone, MapPin, Clock, MessageCircle, Users, Shield } from 'lucide-react';

const Contact = () => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f9fafb',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-150px',
                right: '-150px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, rgba(184, 134, 11, 0) 70%)',
                borderRadius: '50%',
                zIndex: '1'
            }}></div>

            <div style={{
                position: 'absolute',
                bottom: '-200px',
                left: '-200px',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.03) 0%, rgba(184, 134, 11, 0) 70%)',
                borderRadius: '50%',
                zIndex: '1'
            }}></div>

            {/* Main Content */}
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 24px',
                position: 'relative',
                zIndex: '2'
            }}>
                {/* Header Section */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '60px',
                    paddingTop: '40px'
                }}>
                    <div style={{
                        marginBottom: '20px'
                    }}>
                        <Title text1={'CONTACT'} text2={'US'} />
                    </div>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: '#6b7280',
                        maxWidth: '600px',
                        margin: '0 auto',
                        lineHeight: '1.6'
                    }}>
                        Get in touch with our team for personalized assistance
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="contact-grid" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '60px'
                }}>
                    {/* Left Side: Contact Info & Cards */}
                    <div style={{
                        flex: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '40px'
                    }}>
                        {/* Contact Card */}
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '40px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h2 style={{
                                fontSize: '28px',
                                fontWeight: '700',
                                color: '#1a202c',
                                marginBottom: '30px',
                                position: 'relative',
                                display: 'inline-block'
                            }}>
                                Our Store
                                <span style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '0',
                                    width: '60px',
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #b8860b, #fbbf24)',
                                    borderRadius: '2px'
                                }}></span>
                            </h2>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '16px',
                                    padding: '20px',
                                    background: '#fef3c7',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.15)';
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
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)'
                                    }}>
                                        <MapPin style={{ color: '#b8860b' }} size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1a202c',
                                            marginBottom: '4px'
                                        }}>
                                            Visit Us
                                        </h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#6b7280',
                                            lineHeight: '1.5'
                                        }}>
                                            H NO 6E, Khanpatti, Vaishali<br />
                                            Bihar, India - 844122
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '20px',
                                    background: '#fef3c7',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.15)';
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
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)'
                                    }}>
                                        <Phone style={{ color: '#b8860b' }} size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1a202c',
                                            marginBottom: '4px'
                                        }}>
                                            Call Us
                                        </h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }}>
                                            +91 9599548458
                                        </p>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    padding: '20px',
                                    background: '#fef3c7',
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.15)';
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
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)'
                                    }}>
                                        <Mail style={{ color: '#b8860b' }} size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#1a202c',
                                            marginBottom: '4px'
                                        }}>
                                            Email Us
                                        </h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: '#6b7280'
                                        }}>
                                            support@jewelnest.com
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div style={{
                                marginTop: '32px',
                                padding: '24px',
                                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                                borderRadius: '16px',
                                borderLeft: '4px solid #b8860b'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '12px'
                                }}>
                                    <Clock style={{ color: '#b8860b' }} size={20} />
                                    <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#1a202c'
                                    }}>
                                        Customer Support Hours
                                    </h4>
                                </div>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    lineHeight: '1.5'
                                }}>
                                    Monday - Saturday: 10:00 AM - 7:00 PM<br />
                                    Sunday: 11:00 AM - 5:00 PM
                                </p>
                            </div>
                        </div>

                        {/* Features Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #ffffff, #fefce8)',
                            borderRadius: '24px',
                            padding: '32px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1a202c',
                                marginBottom: '24px',
                                textAlign: 'center'
                            }}>
                                Why Choose Us
                            </h3>

                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Users style={{ color: '#b8860b' }} size={20} />
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#4b5563'
                                    }}>
                                        Personalized Customer Service
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <MessageCircle style={{ color: '#b8860b' }} size={20} />
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#4b5563'
                                    }}>
                                        Quick Response Time
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <Shield style={{ color: '#b8860b' }} size={20} />
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#4b5563'
                                    }}>
                                        Secure & Confidential
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Contact Form */}
                    <div style={{
                        flex: '1'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '40px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            height: '100%'
                        }}>
                            <div style={{
                                marginBottom: '32px'
                            }}>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    marginBottom: '12px',
                                    position: 'relative',
                                    display: 'inline-block'
                                }}>
                                    Send us a Message
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '-8px',
                                        left: '0',
                                        width: '80px',
                                        height: '3px',
                                        background: 'linear-gradient(90deg, #b8860b, #fbbf24)',
                                        borderRadius: '2px'
                                    }}></span>
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    lineHeight: '1.6'
                                }}>
                                    Fill out the form below and our team will get back to you within 24 hours.
                                </p>
                            </div>

                            <ContactForm />
                        </div>
                    </div>
                </div>

                {/* Map/CTA Section */}
                <div style={{
                    marginTop: '80px',
                    textAlign: 'center',
                    padding: '40px',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1a202c',
                        marginBottom: '16px'
                    }}>
                        Visit Our Store
                    </h3>
                    <p style={{
                        fontSize: '16px',
                        color: '#6b7280',
                        marginBottom: '32px',
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Experience our jewelry collection in person. Our experts are available to assist you with personalized recommendations.
                    </p>
                    <div style={{
                        height: '200px',
                        background: 'linear-gradient(135deg, #e5e7eb, #d1d5db)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '14px',
                        marginBottom: '32px'
                    }}>
                        <div style={{
                            textAlign: 'center'
                        }}>
                            <MapPin size={40} style={{ color: '#9ca3af', marginBottom: '12px' }} />
                            <p>Interactive Map Coming Soon</p>
                            <p style={{ fontSize: '12px', marginTop: '4px' }}>📍 Khanpatti, Vaishali, Bihar</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Embedded animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .contact-card {
                    animation: fadeIn 0.6s ease-out;
                }

                .contact-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                }

                @media (min-width: 768px) {
                    .contact-grid {
                        flex-direction: row;
                        gap: 80px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Contact;