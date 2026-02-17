import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const ContactForm = () => {
    const { backendUrl, token, userId } = useContext(ShopContext);

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    // Animation state
    const [submitAnimation, setSubmitAnimation] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.trim().length < 3) {
            newErrors.subject = 'Subject must be at least 3 characters';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 5) {
            newErrors.message = 'Message must be at least 5 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill all required fields correctly", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        if (!backendUrl) {
            console.error("Backend URL is not configured");
            toast.error("Configuration error. Please refresh the page.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setLoading(true);
        setSubmitAnimation(true);

        try {
            // Sanitize and validate data
            const sanitizedName = formData.name.trim().substring(0, 100);
            const sanitizedEmail = formData.email.trim().toLowerCase();
            const sanitizedSubject = formData.subject.trim().substring(0, 200);
            const sanitizedMessage = formData.message.trim().substring(0, 5000);

            // Validate sanitized data
            if (!sanitizedName || sanitizedName.length < 2) {
                throw new Error("Name must be at least 2 characters");
            }
            if (!sanitizedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                throw new Error("Invalid email format");
            }
            if (!sanitizedSubject || sanitizedSubject.length < 3) {
                throw new Error("Subject must be at least 3 characters");
            }
            if (!sanitizedMessage || sanitizedMessage.length < 5) {
                throw new Error("Message must be at least 5 characters");
            }

            const contactData = {
                userId: userId || null,
                name: sanitizedName,
                email: sanitizedEmail,
                subject: sanitizedSubject,
                message: sanitizedMessage,
                phoneNumber: '',
                category: 'general',
                priority: 'medium'
            };

            console.log("Sending contact data:", contactData);
            console.log("Backend URL:", backendUrl);

            const response = await axios.post(
                `${backendUrl}/api/contact/send`,
                contactData,
                {
                    headers: {
                        ...(token && { token }),
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );

            console.log("Response:", response.data);

            if (response.data.success) {
                toast.success("✅ Message sent successfully! We'll get back to you soon.", {
                    position: "top-right",
                    autoClose: 5000,
                });

                setSuccess(true);
                setFormData({ name: '', email: '', subject: '', message: '' });

                setTimeout(() => setSubmitAnimation(false), 1000);
                setTimeout(() => setSuccess(false), 5000);
            } else {
                throw new Error(response.data.message || "Failed to send message");
            }
        } catch (error) {
            console.error("Contact form error:", error);

            let errorMessage = "Failed to send message. Please try again.";

            if (error.message && error.message.includes("at least")) {
                errorMessage = error.message;
            } else if (error.response?.status === 500) {
                errorMessage = "⚠️ Server error. Our team has been notified. Please try again later or contact us directly.";
                console.error("500 Server Error:", error.response?.data);
            } else if (error.response?.status === 400) {
                errorMessage = error.response?.data?.message || "Invalid data. Please check your input.";
            } else if (error.response?.status === 401) {
                errorMessage = "Authentication error. Please log in again.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please check your internet connection.";
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                errorMessage = "Network error. Please check if the backend server is running.";
            }

            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
            });

            setSubmitAnimation(false);
        } finally {
            setLoading(false);
        }
    };

    // Container styles
    const containerStyle = {
        maxWidth: '500px',
        margin: '0 auto',
        padding: 'clamp(30px, 5vw, 50px)',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        borderRadius: '28px',
        boxShadow: '20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        position: 'relative',
        overflow: 'hidden',
        animation: 'slideInUp 0.8s ease-out'
    };

    // Decorative elements
    const decorativeCircles = [
        { top: '-50px', left: '-50px', size: '100px', color: 'rgba(102, 126, 234, 0.1)' },
        { top: '60%', right: '-30px', size: '80px', color: 'rgba(118, 75, 162, 0.08)' },
        { bottom: '-40px', left: '30%', size: '70px', color: 'rgba(59, 130, 246, 0.05)' }
    ];

    // Form field styles
    const inputContainerStyle = {
        marginBottom: '24px',
        position: 'relative'
    };

    const labelStyle = (hasError) => ({
        display: 'block',
        fontSize: 'clamp(13px, 1.5vw, 14px)',
        fontWeight: '600',
        color: hasError ? '#ef4444' : '#64748b',
        marginBottom: '8px',
        transition: 'all 0.3s ease',
        paddingLeft: '4px'
    });

    const inputStyle = (fieldName, hasError) => ({
        width: '100%',
        padding: 'clamp(14px, 2vw, 16px) clamp(16px, 2.5vw, 20px)',
        background: 'linear-gradient(145deg, #f8fafc, #ffffff)',
        border: `2px solid ${hasError ? '#ef4444' : (focusedField === fieldName ? '#667eea' : '#e2e8f0')}`,
        borderRadius: '16px',
        fontSize: 'clamp(14px, 1.5vw, 15px)',
        fontWeight: '500',
        color: '#1e293b',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        outline: 'none',
        boxShadow: hasError
            ? '0 4px 20px rgba(239, 68, 68, 0.1)'
            : focusedField === fieldName
                ? '0 8px 30px rgba(102, 126, 234, 0.15)'
                : 'inset 5px 5px 10px #e2e8f0, inset -5px -5px 10px #ffffff',
        fontFamily: "'Inter', sans-serif"
    });

    const errorStyle = {
        color: '#ef4444',
        fontSize: '12px',
        fontWeight: '500',
        marginTop: '6px',
        paddingLeft: '4px',
        animation: 'fadeIn 0.3s ease-out'
    };

    const textareaStyle = {
        ...inputStyle('message'),
        height: '140px',
        resize: 'vertical',
        lineHeight: '1.6'
    };

    const submitButtonStyle = {
        width: '100%',
        padding: 'clamp(16px, 2vw, 18px)',
        background: success
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : loading
                ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '16px',
        fontSize: 'clamp(15px, 1.5vw, 16px)',
        fontWeight: '700',
        cursor: loading || success ? 'not-allowed' : 'pointer',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        boxShadow: success
            ? '0 10px 40px rgba(16, 185, 129, 0.3)'
            : loading
                ? '0 10px 30px rgba(107, 114, 128, 0.2)'
                : '0 10px 40px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden',
        transform: submitAnimation ? 'scale(0.95)' : 'scale(1)',
        animation: submitAnimation ? 'buttonPulse 0.5s ease-in-out' : 'none'
    };

    const submitButtonHoverStyle = {
        transform: 'translateY(-3px)',
        boxShadow: '0 20px 50px rgba(102, 126, 234, 0.4)',
        background: 'linear-gradient(135deg, #5a6fd8 0%, #68428f 100%)'
    };

    const successIconStyle = {
        width: '24px',
        height: '24px',
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'bounceIn 0.5s ease-out'
    };

    const loadingSpinnerStyle = {
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        borderTopColor: 'white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    const headingStyle = {
        fontSize: 'clamp(28px, 3vw, 36px)',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        marginBottom: 'clamp(20px, 3vw, 30px)',
        letterSpacing: '-0.5px'
    };

    const subheadingStyle = {
        fontSize: 'clamp(14px, 1.5vw, 16px)',
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 'clamp(30px, 4vw, 40px)',
        lineHeight: '1.6',
        maxWidth: '400px',
        marginLeft: 'auto',
        marginRight: 'auto'
    };

    return (
        <div style={containerStyle}>
            {/* Decorative Circles */}
            {decorativeCircles.map((circle, index) => (
                <div
                    key={index}
                    style={{
                        position: 'absolute',
                        top: circle.top,
                        left: circle.left,
                        right: circle.right,
                        bottom: circle.bottom,
                        width: circle.size,
                        height: circle.size,
                        background: circle.color,
                        borderRadius: '50%',
                        pointerEvents: 'none',
                        animation: `float ${3 + index}s infinite ease-in-out`,
                        animationDelay: `${index * 0.5}s`
                    }}
                />
            ))}

            {/* Header */}
            <div style={headingStyle}>
                Get In Touch
            </div>
            <div style={subheadingStyle}>
                Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
            </div>

            {/* Form */}
            <form onSubmit={onSubmitHandler} style={{ position: 'relative', zIndex: '1' }}>
                {/* Name Field */}
                <div style={inputContainerStyle}>
                    <label style={labelStyle(errors.name)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={errors.name ? '#ef4444' : '#667eea'} strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Full Name *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Enter your full name"
                        style={inputStyle('name', errors.name)}
                        disabled={loading || success}
                    />
                    {errors.name && <div style={errorStyle}>{errors.name}</div>}
                </div>

                {/* Email Field */}
                <div style={inputContainerStyle}>
                    <label style={labelStyle(errors.email)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={errors.email ? '#ef4444' : '#667eea'} strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" />
                                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            Email Address *
                        </div>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="your.email@example.com"
                        style={inputStyle('email', errors.email)}
                        disabled={loading || success}
                    />
                    {errors.email && <div style={errorStyle}>{errors.email}</div>}
                </div>

                {/* Subject Field */}
                <div style={inputContainerStyle}>
                    <label style={labelStyle(errors.subject)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={errors.subject ? '#ef4444' : '#667eea'} strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Subject *
                        </div>
                    </label>
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('subject')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="What is this regarding?"
                        style={inputStyle('subject', errors.subject)}
                        disabled={loading || success}
                    />
                    {errors.subject && <div style={errorStyle}>{errors.subject}</div>}
                </div>

                {/* Message Field */}
                <div style={inputContainerStyle}>
                    <label style={labelStyle(errors.message)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={errors.message ? '#ef4444' : '#667eea'} strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            Your Message *
                        </div>
                    </label>
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('message')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="Please describe your inquiry in detail..."
                        style={textareaStyle}
                        disabled={loading || success}
                    />
                    {errors.message && <div style={errorStyle}>{errors.message}</div>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    style={submitButtonStyle}
                    onMouseEnter={(e) => {
                        if (!loading && !success) {
                            Object.assign(e.currentTarget.style, submitButtonHoverStyle);
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading && !success) {
                            e.currentTarget.style.transform = submitAnimation ? 'scale(0.95)' : 'scale(1)';
                            e.currentTarget.style.boxShadow = success
                                ? '0 10px 40px rgba(16, 185, 129, 0.3)'
                                : loading
                                    ? '0 10px 30px rgba(107, 114, 128, 0.2)'
                                    : '0 10px 40px rgba(102, 126, 234, 0.3)';
                            e.currentTarget.style.background = success
                                ? 'linear-gradient(135deg, #10b981, #059669)'
                                : loading
                                    ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        }
                    }}
                    disabled={loading || success}
                >
                    {success ? (
                        <>
                            <div style={successIconStyle}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#10b981" stroke="none">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </div>
                            Message Sent Successfully!
                        </>
                    ) : loading ? (
                        <>
                            <div style={loadingSpinnerStyle}></div>
                            Sending Your Message...
                        </>
                    ) : (
                        <>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13" />
                                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                            Send Message
                        </>
                    )}
                </button>

                {/* Form Note */}
                <div style={{
                    marginTop: '20px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    textAlign: 'center',
                    lineHeight: '1.5'
                }}>
                    * Required fields. We typically respond within 24 hours.
                </div>
            </form>

            {/* Contact Info Footer */}
            <div style={{
                marginTop: '40px',
                paddingTop: '30px',
                borderTop: '2px solid #f1f5f9',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '20px',
                textAlign: 'center'
            }}>
                <div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Visit Us</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>JewelNest, Banipur, Murshidabad</div>
                </div>

                <div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Call Us</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>+91 86090 30343</div>
                </div>

                <div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        background: 'linear-gradient(135deg, #667eea20, #764ba220)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Email Us</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>jewelnest86@gmail.com</div>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes slideInUp {
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
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-20px) scale(1.05);
                    }
                }

                @keyframes buttonPulse {
                    0%, 100% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(0.95);
                    }
                }

                @keyframes bounceIn {
                    0% {
                        transform: scale(0);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.2);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }

                ::placeholder {
                    color: #94a3b8;
                    opacity: 0.7;
                }

                input:focus, textarea:focus {
                    outline: none;
                }

                textarea::-webkit-scrollbar {
                    width: 6px;
                }

                textarea::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }

                textarea::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 3px;
                }

                .error-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default ContactForm;