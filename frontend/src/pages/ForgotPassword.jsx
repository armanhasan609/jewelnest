import React, { useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import { toast } from 'react-toastify';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2, Sparkles, Shield, Key, ChevronRight } from 'lucide-react';

const ForgotPassword = () => {
    const { backendUrl } = useContext(ShopContext);
    const navigate = useNavigate();
    const [mounted, setMounted] = useState(false);
    const stepRef = useRef(null);

    // Form States
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);

    // Page Title Management
    useEffect(() => {
        document.title = step === 1 ? "Forgot Password | JewelNest" : "Reset Your Password | JewelNest";
    }, [step]);

    // Mount effect for initial animation
    useEffect(() => {
        setMounted(true);
    }, []);

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setIsResendDisabled(false);
        }
    }, [countdown]);

    /**
     * Step 1: Request Password Reset OTP
     */
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter a registered email address.");

        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });

            if (data.success) {
                toast.success(data.message || "OTP sent successfully to your email.");
                setStep(2);
                setCountdown(60);
                setIsResendDisabled(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while sending OTP.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Step 2: Validate OTP and Update Password
     */
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error("Please enter a valid 6-digit OTP.");
        if (newPassword.length < 8) return toast.error("Password must be at least 8 characters long.");

        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/user/reset-password`, {
                email,
                otp,
                newPassword
            });

            if (data.success) {
                toast.success("Password updated successfully. Redirecting to login...");
                setTimeout(() => navigate('/login'), 2000);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resend OTP
     */
    const handleResendOtp = async () => {
        if (isResendDisabled) return;

        try {
            setLoading(true);
            const { data } = await axios.post(`${backendUrl}/api/user/forgot-password`, { email });

            if (data.success) {
                toast.success("New OTP sent successfully!");
                setCountdown(60);
                setIsResendDisabled(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f9fafb 0%, #fef3c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.08) 0%, rgba(184, 134, 11, 0) 70%)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite'
            }}></div>

            <div style={{
                position: 'absolute',
                bottom: '-150px',
                left: '-150px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(184, 134, 11, 0.05) 0%, rgba(184, 134, 11, 0) 70%)',
                borderRadius: '50%',
                animation: 'float 8s ease-in-out infinite 1s'
            }}></div>

            <div ref={stepRef} style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                maxWidth: '500px',
                zIndex: '1',
                opacity: mounted ? 1 : 0,
                transition: 'opacity 0.6s ease, transform 0.6s ease',
                transformOrigin: 'center'
            }}>
                {/* Progress Steps */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '40px',
                    gap: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: step === 1 ? 'linear-gradient(45deg, #b8860b, #fbbf24)' : '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: step === 1 ? 'white' : '#9ca3af',
                            fontWeight: '600',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            1
                        </div>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: step === 1 ? '#1a202c' : '#9ca3af',
                            transition: 'color 0.3s ease'
                        }}>
                            Verify Email
                        </span>
                    </div>

                    <div style={{
                        width: '60px',
                        height: '2px',
                        background: step === 2 ? 'linear-gradient(90deg, #b8860b, #fbbf24)' : '#e5e7eb',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: step === 2 ? 'linear-gradient(45deg, #b8860b, #fbbf24)' : '#e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: step === 2 ? 'white' : '#9ca3af',
                            fontWeight: '600',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>
                            2
                        </div>
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: step === 2 ? '#1a202c' : '#9ca3af',
                            transition: 'color 0.3s ease'
                        }}>
                            Reset Password
                        </span>
                    </div>
                </div>

                {/* Main Card */}
                <div style={{
                    background: 'white',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Security Badge */}
                    <div style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#fef3c7',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#b8860b',
                        animation: 'pulse 2s infinite'
                    }}>
                        <Shield size={12} />
                        Secure
                    </div>

                    {/* Navigation and Branding */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '32px'
                    }}>
                        <button
                            onClick={() => step === 2 ? setStep(1) : navigate('/login')}
                            style={{
                                background: '#f9fafb',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                color: '#6b7280'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f3f4f6';
                                e.currentTarget.style.transform = 'translateX(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f9fafb';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Sparkles style={{ color: '#b8860b' }} size={20} />
                            <span style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                JewelNest
                            </span>
                        </div>

                        <div style={{ width: '40px' }}></div> {/* Spacer */}
                    </div>

                    {/* Content with proper animation */}
                    <div style={{
                        position: 'relative',
                        minHeight: '300px'
                    }}>
                        {step === 1 ? (
                            <div key="step1" style={{
                                position: 'absolute',
                                width: '100%',
                                animation: 'slideInLeft 0.5s ease-out forwards'
                            }}>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    marginBottom: '12px',
                                    textAlign: 'center'
                                }}>
                                    Forgot Password?
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    marginBottom: '32px',
                                    lineHeight: '1.6'
                                }}>
                                    Enter your email address and we'll send you a secure recovery code.
                                </p>

                                <form onSubmit={handleRequestOtp}>
                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '24px'
                                    }}>
                                        <Mail style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af'
                                        }} size={20} />
                                        <input
                                            type="email"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 48px',
                                                borderRadius: '12px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '16px',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: '#f9fafb',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#b8860b';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                                e.target.style.background = 'white';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.background = '#f9fafb';
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                                <span>Sending...</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShieldCheck size={20} />
                                                <span>Send Secure Code</span>
                                                <ChevronRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div style={{
                                    marginTop: '24px',
                                    padding: '16px',
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    borderLeft: '4px solid #b8860b'
                                }}>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        textAlign: 'center',
                                        margin: '0',
                                        lineHeight: '1.5'
                                    }}>
                                        <Key size={14} style={{ marginRight: '6px', color: '#b8860b', verticalAlign: 'middle' }} />
                                        We'll send a 6-digit verification code to your email. Check your spam folder if you don't see it.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div key="step2" style={{
                                position: 'absolute',
                                width: '100%',
                                animation: 'slideInRight 0.5s ease-out forwards'
                            }}>
                                <h2 style={{
                                    fontSize: '28px',
                                    fontWeight: '700',
                                    color: '#1a202c',
                                    marginBottom: '12px',
                                    textAlign: 'center'
                                }}>
                                    Reset Your Password
                                </h2>
                                <p style={{
                                    fontSize: '16px',
                                    color: '#6b7280',
                                    textAlign: 'center',
                                    marginBottom: '32px',
                                    lineHeight: '1.6'
                                }}>
                                    Code sent to <span style={{ fontWeight: '600', color: '#1a202c' }}>{email}</span>
                                </p>

                                <form onSubmit={handleResetPassword}>
                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '16px'
                                    }}>
                                        <ShieldCheck style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af'
                                        }} size={20} />
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit code"
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 48px',
                                                borderRadius: '12px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '18px',
                                                letterSpacing: '8px',
                                                textAlign: 'center',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: '#f9fafb',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#b8860b';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                                e.target.style.background = 'white';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.background = '#f9fafb';
                                            }}
                                        />
                                    </div>

                                    <div style={{
                                        position: 'relative',
                                        marginBottom: '24px'
                                    }}>
                                        <Lock style={{
                                            position: 'absolute',
                                            left: '16px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af'
                                        }} size={20} />
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '16px 16px 16px 48px',
                                                borderRadius: '12px',
                                                border: '2px solid #e5e7eb',
                                                fontSize: '16px',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: '#f9fafb',
                                                boxSizing: 'border-box'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = '#b8860b';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                                e.target.style.background = 'white';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = '#e5e7eb';
                                                e.target.style.boxShadow = 'none';
                                                e.target.style.background = '#f9fafb';
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '16px',
                                            background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            marginBottom: '16px'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(184, 134, 11, 0.3)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!loading) {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }
                                        }}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                                <span>Updating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Key size={20} />
                                                <span>Reset Password</span>
                                            </>
                                        )}
                                    </button>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        alignItems: 'center',
                                        fontSize: '14px',
                                        color: '#6b7280'
                                    }}>
                                        <span>Didn't receive code?</span>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={isResendDisabled}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: isResendDisabled ? '#9ca3af' : '#b8860b',
                                                fontWeight: '600',
                                                cursor: isResendDisabled ? 'not-allowed' : 'pointer',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isResendDisabled) {
                                                    e.currentTarget.style.color = '#fbbf24';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isResendDisabled) {
                                                    e.currentTarget.style.color = '#b8860b';
                                                }
                                            }}
                                        >
                                            {isResendDisabled ? `Resend in ${countdown}s` : 'Resend Code'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '14px',
                    color: '#9ca3af'
                }}>
                    <p style={{ margin: '0' }}>
                        Remember your password?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#b8860b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#fbbf24';
                                e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#b8860b';
                                e.currentTarget.style.textDecoration = 'none';
                            }}
                        >
                            Sign in instead
                        </button>
                    </p>
                </div>
            </div>

            {/* Embedded animations */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(0.98);
                    }
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;