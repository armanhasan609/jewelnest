import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../services/authService";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import {
    Eye,
    EyeOff,
    Lock,
    Mail,
    User,
    Phone,
    LogIn,
    UserPlus,
    Shield,
    ArrowRight,
    Crown,
} from "lucide-react";

const Login = () => {
    const [currentState, setCurrentState] = useState("Login");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();
    const { login, setToken, setRole, setUserId, backendUrl } = useContext(ShopContext);

    const toggleState = () => {
        setCurrentState((prev) => (prev === "Login" ? "Sign Up" : "Login"));
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};

        if (currentState === "Sign Up") {
            if (!name.trim()) newErrors.name = "Full name is required";
            else if (name.length < 3) newErrors.name = "Name must be at least 3 characters";

            if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
            else if (!/^\d{10}$/.test(phoneNumber)) newErrors.phoneNumber = "Invalid 10-digit phone number";
        }

        if (!email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Invalid email address";

        if (!password.trim()) newErrors.password = "Password is required";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            if (currentState === "Login") {
                const data = await loginUser({ email, password });

                if (data.success && data.token) {
                    const isSuper = data.user?.isSuperAdmin || false;
                    const role = data.user?.role || "user";

                    login(data.token, role, data.user);
                    setToken(data.token);
                    setRole(role);
                    setUserId(data.user?._id);

                    localStorage.setItem('isSuperAdmin', isSuper);

                    toast.success(`Welcome back, ${data.user?.name || "User"}`);
                    navigate(role === "admin" ? "/admin/dashboard" : "/");
                } else {
                    toast.error(data.message || "Login failed");
                }
            } else {
                const response = await registerUser({
                    name,
                    phoneNumber,
                    email,
                    password
                });

                if (response.success) {
                    toast.success("Account created successfully! Please login.");
                    setCurrentState("Login");
                    // Reset form
                    setName("");
                    setPhoneNumber("");
                    setEmail("");
                    setPassword("");
                } else {
                    toast.error(response.message || "Registration failed");
                }
            }
        } catch (err) {
            console.error("Error:", err);
            toast.error(err.response?.data?.message || "Something went wrong");
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
            padding: '20px'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '480px',
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                padding: '40px',
                position: 'relative'
            }}>
                {/* Decorative Elements */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white'
                }}>
                    <Crown size={14} />
                    Premium
                </div>

                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: '#fef3c7',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#b8860b'
                }}>
                    <Shield size={14} />
                    Secure
                </div>

                {/* Header */}
                <div style={{ marginBottom: '40px', marginTop: '40px' }}>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textAlign: 'center',
                        marginBottom: '12px'
                    }}>
                        {currentState === "Login" ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p style={{
                        color: '#6b7280',
                        fontSize: '16px',
                        textAlign: 'center',
                        margin: 0
                    }}>
                        {currentState === "Login"
                            ? "Sign in to continue your jewelry journey"
                            : "Join JewelNest for premium collections"}
                    </p>
                </div>

                <form onSubmit={onSubmitHandler} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {currentState === "Sign Up" && (
                        <>
                            {/* Name Field */}
                            <div style={{ position: 'relative' }}>
                                <User style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: errors.name ? '#dc2626' : '#9ca3af',
                                    transition: 'color 0.3s ease'
                                }} size={18} />
                                <input
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 48px',
                                        borderRadius: '12px',
                                        border: `2px solid ${errors.name ? '#dc2626' : '#e5e7eb'}`,
                                        fontSize: '15px',
                                        backgroundColor: '#f9fafb',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#b8860b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                        e.target.style.backgroundColor = 'white';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = errors.name ? '#dc2626' : '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }}
                                />
                                {errors.name && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.name}</p>}
                            </div>

                            {/* Phone Field */}
                            <div style={{ position: 'relative' }}>
                                <Phone style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: errors.phoneNumber ? '#dc2626' : '#9ca3af',
                                    transition: 'color 0.3s ease'
                                }} size={18} />
                                <input
                                    placeholder="Phone (10 digits)"
                                    value={phoneNumber}
                                    onChange={(e) =>
                                        setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                                    }
                                    style={{
                                        width: '100%',
                                        padding: '14px 14px 14px 48px',
                                        borderRadius: '12px',
                                        border: `2px solid ${errors.phoneNumber ? '#dc2626' : '#e5e7eb'}`,
                                        fontSize: '15px',
                                        backgroundColor: '#f9fafb',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#b8860b';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                        e.target.style.backgroundColor = 'white';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = errors.phoneNumber ? '#dc2626' : '#e5e7eb';
                                        e.target.style.boxShadow = 'none';
                                        e.target.style.backgroundColor = '#f9fafb';
                                    }}
                                />
                                {errors.phoneNumber && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.phoneNumber}</p>}
                            </div>
                        </>
                    )}

                    {/* Email Field */}
                    <div style={{ position: 'relative' }}>
                        <Mail style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: errors.email ? '#dc2626' : '#9ca3af',
                            transition: 'color 0.3s ease'
                        }} size={18} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                borderRadius: '12px',
                                border: `2px solid ${errors.email ? '#dc2626' : '#e5e7eb'}`,
                                fontSize: '15px',
                                backgroundColor: '#f9fafb',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#b8860b';
                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                e.target.style.backgroundColor = 'white';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.email ? '#dc2626' : '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = '#f9fafb';
                            }}
                        />
                        {errors.email && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.email}</p>}
                    </div>

                    {/* Password Field */}
                    <div style={{ position: 'relative' }}>
                        <Lock style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: errors.password ? '#dc2626' : '#9ca3af',
                            transition: 'color 0.3s ease'
                        }} size={18} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '14px 48px 14px 48px',
                                borderRadius: '12px',
                                border: `2px solid ${errors.password ? '#dc2626' : '#e5e7eb'}`,
                                fontSize: '15px',
                                backgroundColor: '#f9fafb',
                                transition: 'all 0.3s ease',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#b8860b';
                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                                e.target.style.backgroundColor = 'white';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = errors.password ? '#dc2626' : '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                                e.target.style.backgroundColor = '#f9fafb';
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                padding: '4px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#b8860b';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#6b7280';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        {errors.password && <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>{errors.password}</p>}
                    </div>

                    {/* Reset Password Link - Login Only */}
                    {currentState === "Login" && (
                        <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#b8860b',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.gap = '8px';
                                    e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.gap = '6px';
                                    e.currentTarget.style.textDecoration = 'none';
                                }}
                            >
                                <Lock size={14} />
                                Reset Password
                            </button>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(45deg, #b8860b, #fbbf24)',
                            color: 'white',
                            padding: '16px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            marginTop: '8px',
                            opacity: loading ? 0.8 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(184, 134, 11, 0.3)';
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
                                <div style={{
                                    width: '18px',
                                    height: '18px',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                {currentState === "Login" ? <LogIn size={20} /> : <UserPlus size={20} />}
                                {currentState === "Login" ? "Sign In" : "Create Account"}
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {/* Toggle between Login and Sign Up */}
                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                        <button
                            type="button"
                            onClick={toggleState}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#b8860b',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                margin: '0 auto',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.gap = '12px';
                                e.currentTarget.style.background = '#fef3c7';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.gap = '8px';
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {currentState === "Login" ? (
                                <>
                                    <UserPlus size={16} />
                                    New here? Create an account
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    Already have an account? Sign In
                                </>
                            )}
                        </button>
                    </div>

                    {/* Terms - Only for Sign Up */}
                    {currentState === "Sign Up" && (
                        <div style={{
                            textAlign: 'center',
                            marginTop: '24px'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                color: '#6b7280',
                                fontSize: '12px'
                            }}>
                                <Shield size={14} style={{ color: '#b8860b' }} />
                                <p style={{ margin: 0 }}>
                                    By registering, you agree to our{' '}
                                    <span style={{ color: '#b8860b', fontWeight: '600', cursor: 'pointer' }}>
                                        Terms
                                    </span>{' '}
                                    &{' '}
                                    <span style={{ color: '#b8860b', fontWeight: '600', cursor: 'pointer' }}>
                                        Privacy Policy
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Animations */}
            <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        form > * {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
        </div>
    );
};

export default Login;