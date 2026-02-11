import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import {
    User, Mail, ShieldCheck, ShoppingCart,
    LogOut, Phone, Lock, Edit2, Save, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const navigate = useNavigate();
    const { token, role, logout, backendUrl } = useContext(ShopContext);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    /* ================= FETCH PROFILE ================= */
    const fetchUserProfile = async () => {
        if (!token) return;

        try {
            setProfileLoading(true);

            // Try /api/users/profile first
            let res = await axios.get(backendUrl + '/api/users/profile', {
                headers: { token }
            });

            if (!res.data.success) {
                // Fallback to /api/user/profile
                res = await axios.get(backendUrl + '/api/user/profile', {
                    headers: { token }
                });
            }

            if (res.data.success) {
                const user = res.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                setUserData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    password: '' // Keep empty for security
                });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            toast.error("Failed to load profile from server");

            // Fallback to local storage if server fails
            const stored = JSON.parse(localStorage.getItem('user'));
            if (stored) {
                setUserData({
                    name: stored.name || '',
                    email: stored.email || '',
                    phone: stored.phone || '',
                    password: ''
                });
            }
        } finally {
            setProfileLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserProfile();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    /* ================= UPDATE PROFILE ================= */
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Note: Ensure your backend route is exactly '/api/users/update-profile'
            const res = await axios.post(
                backendUrl + '/api/users/update-profile',
                userData,
                { headers: { token } }
            );

            if (res.data.success) {
                toast.success("Profile updated successfully!");
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setUserData(prev => ({ ...res.data.user, password: '' }));
                setIsEditing(false);
            } else {
                toast.error(res.data.message);
            }
        } catch (err) {
            console.error("Update Error:", err);
            toast.error(err.response?.data?.message || "Update failed. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (profileLoading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh'
            }}>
                <div style={{
                    animation: 'spin 1s linear infinite',
                    borderRadius: '9999px',
                    height: '3rem',
                    width: '3rem',
                    borderTop: '2px solid #111827',
                    borderBottom: '2px solid #111827'
                }}></div>
                <p style={{
                    marginTop: '1rem',
                    color: '#4B5563',
                    fontWeight: '500'
                }}>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '56rem',
            margin: '0 auto',
            padding: '1rem',
            marginTop: '1.5rem'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
                border: '1px solid #F3F4F6'
            }}>
                {/* Header Gradient */}
                <div style={{
                    height: '7rem',
                    background: 'linear-gradient(to right, #111827, #374151)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '1rem'
                }}>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                height: '2.5rem',
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(12px)',
                                color: 'white',
                                padding: '0 1rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <Edit2 size={16} /> Edit Profile
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(false)}
                            style={{
                                height: '2.5rem',
                                backgroundColor: '#EF4444',
                                color: 'white',
                                padding: '0 1rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
                        >
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>

                <div style={{
                    paddingLeft: '1.5rem',
                    paddingRight: '1.5rem',
                    paddingBottom: '2rem',
                    marginTop: '-2.5rem'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        marginBottom: '1.5rem'
                    }}>
                        <div style={{
                            padding: '0.25rem',
                            backgroundColor: 'white',
                            borderRadius: '9999px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{
                                backgroundColor: '#F3F4F6',
                                width: '6rem',
                                height: '6rem',
                                borderRadius: '9999px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9CA3AF'
                            }}>
                                <User size={48} />
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/orders')}
                            style={{
                                backgroundColor: '#000',
                                color: 'white',
                                padding: '0.625rem 1.5rem',
                                borderRadius: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1F2937'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
                        >
                            <ShoppingCart size={18} /> View Orders
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} style={{ marginTop: '1.5rem' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 style={{
                                fontSize: '1.875rem',
                                fontWeight: '900',
                                color: '#1F2937'
                            }}>
                                {isEditing ? "Edit Account" : (userData.name || "User Profile")}
                            </h2>
                            <p style={{
                                color: '#6B7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginTop: '0.25rem',
                                fontWeight: '500'
                            }}>
                                <ShieldCheck size={16} style={{ color: '#10B981' }} />
                                {role === 'admin' ? "Administrator" : "Verified Customer"}
                            </p>
                        </div>

                        <hr style={{ borderColor: '#F3F4F6' }} />

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr',
                            gap: '1.5rem',
                            marginTop: '1.5rem'
                        }}>
                            {/* Name Input */}
                            <div>
                                <label style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#9CA3AF',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginLeft: '0.25rem'
                                }}>Full Name</label>
                                <input
                                    type="text"
                                    disabled={!isEditing}
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: isEditing ? '1px solid #60A5FA' : '1px solid transparent',
                                        backgroundColor: isEditing ? 'white' : '#F9FAFB',
                                        color: '#374151',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        marginTop: '0.5rem'
                                    }}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div>
                                <label style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#9CA3AF',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginLeft: '0.25rem'
                                }}>Email Address</label>
                                <input
                                    type="email"
                                    disabled={true}
                                    value={userData.email}
                                    readOnly
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: '1px solid transparent',
                                        backgroundColor: '#F3F4F6', // Always grey to indicate locked
                                        color: '#6B7280',
                                        cursor: 'not-allowed',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        marginTop: '0.5rem'
                                    }}
                                    placeholder="your@email.com"
                                />
                                {isEditing && (
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#6B7280',
                                        marginTop: '0.25rem',
                                        marginLeft: '0.25rem',
                                        fontStyle: 'italic'
                                    }}>
                                        Email cannot be changed
                                    </p>
                                )}
                            </div>

                            {/* Phone Input */}
                            <div>
                                <label style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#9CA3AF',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginLeft: '0.25rem'
                                }}>Phone Number</label>
                                <input
                                    type="tel"
                                    disabled={!isEditing}
                                    value={userData.phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                                        if (value.length <= 10) {
                                            setUserData({ ...userData, phone: value });
                                        }
                                    }}
                                    maxLength={10}
                                    minLength={10}
                                    pattern="[0-9]{10}"
                                    title="Please enter a valid 10-digit phone number"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: isEditing ? '1px solid #60A5FA' : '1px solid transparent',
                                        backgroundColor: isEditing ? 'white' : '#F9FAFB',
                                        color: '#374151',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        marginTop: '0.5rem'
                                    }}
                                    placeholder="Add phone number"
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label style={{
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#9CA3AF',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    marginLeft: '0.25rem'
                                }}>{isEditing ? "New Password" : "Password"}</label>
                                <input
                                    type="password"
                                    disabled={!isEditing}
                                    value={userData.password}
                                    onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem',
                                        borderRadius: '0.75rem',
                                        border: isEditing ? '1px solid #60A5FA' : '1px solid transparent',
                                        backgroundColor: isEditing ? 'white' : '#F9FAFB',
                                        color: '#374151',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        marginTop: '0.5rem'
                                    }}
                                    placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            paddingTop: '1rem'
                        }}>
                            {isEditing ? (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#059669',
                                        color: 'white',
                                        padding: '0.875rem 2.5rem',
                                        borderRadius: '0.75rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 20px 25px -5px rgba(5, 150, 105, 0.1)',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        opacity: loading ? 0.7 : 1
                                    }}
                                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#047857')}
                                    onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#059669')}
                                >
                                    <Save size={20} /> {loading ? "Saving..." : "Save Changes"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        color: '#EF4444',
                                        fontWeight: 'bold',
                                        padding: '0.875rem 1.5rem',
                                        borderRadius: '0.75rem',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: 'transparent',
                                        border: '1px solid transparent',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FEF2F2';
                                        e.currentTarget.style.borderColor = '#FECACA';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.borderColor = 'transparent';
                                    }}
                                >
                                    <LogOut size={18} /> Logout from Account
                                </button>
                            )}
                        </div>
                    </form>

                    {role === 'admin' && !isEditing && (
                        <div style={{
                            marginTop: '2.5rem',
                            backgroundColor: '#EFF6FF',
                            padding: '1.25rem',
                            borderRadius: '1rem',
                            border: '1px solid #DBEAFE',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <ShieldCheck style={{ color: '#2563EB' }} size={24} />
                                <div>
                                    <p style={{
                                        color: '#1E3A8A',
                                        fontWeight: 'bold'
                                    }}>Admin Privileges Active</p>
                                    <p style={{
                                        color: '#2563EB',
                                        fontSize: '0.75rem'
                                    }}>You have access to the management dashboard.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                style={{
                                    backgroundColor: '#2563EB',
                                    color: 'white',
                                    padding: '0.625rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1D4ED8'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563EB'}
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Profile;