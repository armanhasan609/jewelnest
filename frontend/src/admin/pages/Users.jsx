import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    User, Mail, Shield, Search, Trash2, Ban, Edit3,
    CheckCircle, X, ShieldAlert, RefreshCw, Lock,
    Crown, Zap, Star, Target, Key, Users as UsersIcon,
    AlertTriangle, MoreVertical, Eye, Filter
} from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [stats, setStats] = useState({ total: 0, admins: 0, active: 0, restricted: 0 });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const token = localStorage.getItem('token');
    const amISuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const loggedInUserId = localStorage.getItem('userId');

    const [editModal, setEditModal] = useState(false);
    const [currentUser, setCurrentUser] = useState({ _id: '', name: '', role: '' });

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/user/all`, {
                headers: { token }
            });
            if (response.data.success) {
                const userList = response.data.users || [];
                setUsers(userList);

                // Calculate statistics
                const total = userList.length;
                const admins = userList.filter(u => u.role === 'admin').length;
                const active = userList.filter(u => !(u.isBlocked || (u.restrictedUntil && new Date(u.restrictedUntil) > new Date()))).length;
                const restricted = total - active;

                setStats({ total, admins, active, restricted });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
        else toast.error("Please login as Admin");
    }, []);

    // Actions
    const deleteUser = async (targetId) => {
        setActionLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/user/delete`,
                { targetId },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success("User deleted successfully!");
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        }
    };

    const restrictUser = async (targetId, hours) => {
        setActionLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/user/restrict`,
                { targetId, hours },
                { headers: { token } }
            );
            if (response.data.success) {
                toast.success(hours > 0 ? "User Restricted" : "User Activated");
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        try {
            const response = await axios.post(`${backendUrl}/api/user/update`, {
                targetId: currentUser._id,
                name: currentUser.name,
                role: currentUser.role
            }, { headers: { token } });

            if (response.data.success) {
                toast.success("Updated successfully!");
                setEditModal(false);
                fetchUsers();
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error("Update failed");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter((u) => {
        const userName = u.name ? u.name.toLowerCase() : "";
        const userEmail = u.email ? u.email.toLowerCase() : "";
        const matchesSearch = userName.includes(searchTerm.toLowerCase()) || userEmail.includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const confirmDelete = (user) => {
        if (user._id === loggedInUserId) {
            toast.warning("You cannot delete your own account!");
            return;
        }
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'admin': return '#8b5cf6';
            case 'superadmin': return '#f59e0b';
            default: return '#3b82f6';
        }
    };

    const getStatusColor = (user) => {
        const isRestricted = user.isBlocked || (user.restrictedUntil && new Date(user.restrictedUntil) > new Date());
        return isRestricted ? '#ef4444' : '#10b981';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const containerStyle = {
        padding: '32px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '24px'
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.025em'
    };

    const cardStyle = {
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        padding: '24px'
    };

    const LoadingScreen = () => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '24px'
        }}>
            <div style={{
                position: 'relative',
                width: '80px',
                height: '80px'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: '4px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    borderTop: '4px solid #3b82f6',
                    animation: 'spin 1.5s linear infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(139, 92, 246, 0.1)',
                    borderRadius: '50%',
                    borderTop: '4px solid #8b5cf6',
                    animation: 'spin 2s linear infinite reverse'
                }} />
            </div>
            <div style={{ textAlign: 'center' }}>
                <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '12px'
                }}>
                    Loading User Data
                </h3>
                <p style={{
                    fontSize: '15px',
                    color: '#64748b',
                    maxWidth: '300px'
                }}>
                    Fetching user information and permissions...
                </p>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div style={{
            ...cardStyle,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center'
        }}>
            <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                animation: 'pulse 2s infinite'
            }}>
                <UsersIcon size={40} color="#94a3b8" />
            </div>
            <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '12px'
            }}>
                No Users Found
            </h3>
            <p style={{
                fontSize: '15px',
                color: '#64748b',
                maxWidth: '400px',
                marginBottom: '24px'
            }}>
                User accounts will appear here once they register on your platform.
            </p>
        </div>
    );

    return (
        <div className="page-container">
            <style>{`
                .page-container {
                    padding: 32px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                    min-height: 100vh;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                }

                .header-container {
                     display: flex;
                     justify-content: space-between;
                     align-items: center;
                     margin-bottom: 32px;
                     flex-wrap: wrap;
                     gap: 24px;
                }

                .stats-grid {
                     display: grid;
                     grid-template-columns: repeat(4, 1fr);
                     gap: 20px;
                     margin-bottom: 32px;
                }

                .search-container {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .table-container {
                     overflow-x: auto;
                     border-radius: 12px;
                }
                
                .user-table {
                     width: 100%;
                     border-collapse: collapse;
                     min-width: 800px;
                }

                .table-header {
                    padding: 16px 20px;
                    text-align: left;
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    background-color: #f8fafc;
                    border-bottom: 2px solid #e2e8f0;
                }

                .table-cell {
                    padding: 20px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: middle;
                }

                @media (max-width: 1024px) {
                    .stats-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .page-container {
                         padding: 16px;
                    }

                    .header-container {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .search-container {
                        flex-direction: column;
                        align-items: stretch;
                        width: 100%;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .table-header, .table-cell {
                         padding: 12px 16px;
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        ...cardStyle,
                        maxWidth: '500px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            marginBottom: '24px'
                        }}>
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                            }}>
                                <AlertTriangle size={24} color="white" />
                            </div>
                            <div>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }}>
                                    Delete User Account
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    marginTop: '4px'
                                }}>
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>

                        <p style={{
                            fontSize: '15px',
                            color: '#475569',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            Are you sure you want to permanently delete <strong>{userToDelete?.name}</strong> ({userToDelete?.email})?
                            All their data and activity will be removed from the system.
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setUserToDelete(null);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#475569',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteUser(userToDelete._id)}
                                disabled={actionLoading}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                    opacity: actionLoading ? 0.7 : 1,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {actionLoading ? (
                                    <>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid rgba(255, 255, 255, 0.3)',
                                            borderTop: '2px solid white',
                                            borderRadius: '50%',
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Delete Permanently
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {editModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        ...cardStyle,
                        maxWidth: '400px',
                        width: '90%',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1e293b',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Edit3 size={20} />
                                Edit User
                            </h3>
                            <button
                                onClick={() => setEditModal(false)}
                                style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#f1f5f9',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e2e8f0';
                                    e.currentTarget.style.transform = 'rotate(90deg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f1f5f9';
                                    e.currentTarget.style.transform = 'rotate(0deg)';
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={currentUser.name}
                                    onChange={e => setCurrentUser({ ...currentUser, name: e.target.value })}
                                    required
                                    style={{
                                        padding: '12px 16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}>
                                    Role
                                </label>
                                <select
                                    value={currentUser.role}
                                    onChange={e => setCurrentUser({ ...currentUser, role: e.target.value })}
                                    style={{
                                        padding: '12px 16px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                        backgroundPosition: 'right 0.5rem center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '1.5em 1.5em',
                                        paddingRight: '2.5rem',
                                        appearance: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#3b82f6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => setEditModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '2px solid #e2e8f0',
                                        background: 'white',
                                        color: '#475569',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'white';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoading}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                        opacity: actionLoading ? 0.7 : 1,
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {actionLoading ? (
                                        <>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                borderTop: '2px solid white',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update User'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="header-container">
                <div>
                    <h1 style={titleStyle}>User Management Dashboard</h1>
                    <p style={{
                        fontSize: isMobile ? '13px' : '15px',
                        color: '#64748b',
                        marginTop: '8px',
                        maxWidth: '600px'
                    }}>
                        Manage user accounts, permissions, and access controls with granular control
                    </p>
                </div>

                <button
                    onClick={fetchUsers}
                    disabled={loading}
                    style={{
                        padding: '12px 24px',
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        color: '#475569',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.3s ease',
                        opacity: loading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.1)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }
                    }}
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {[
                    { label: 'Total Users', value: stats.total, color: '#3b82f6', icon: <UsersIcon size={24} />, description: 'All registered accounts' },
                    { label: 'Admins', value: stats.admins, color: '#8b5cf6', icon: <Shield size={24} />, description: 'Administrative accounts' },
                    { label: 'Active', value: stats.active, color: '#10b981', icon: <CheckCircle size={24} />, description: 'Currently active users' },
                    { label: 'Restricted', value: stats.restricted, color: '#f59e0b', icon: <Ban size={24} />, description: 'Suspended accounts' }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            ...cardStyle,
                            borderLeft: `4px solid ${stat.color}`,
                            animation: `slideIn 0.5s ease ${index * 0.1}s both`
                        }}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(-6px)';
                                e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.12)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.06)';
                            }
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px'
                        }}>
                            <div>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    marginBottom: '4px'
                                }}>
                                    {stat.label}
                                </p>
                                <h2 style={{
                                    fontSize: '32px',
                                    fontWeight: '700',
                                    color: '#1e293b'
                                }}>
                                    {stat.value}
                                </h2>
                            </div>
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: `${stat.color}15`,
                                color: stat.color,
                                animation: 'float 3s ease-in-out infinite'
                            }}>
                                {stat.icon}
                            </div>
                        </div>
                        <p style={{
                            fontSize: '12px',
                            color: '#94a3b8',
                            marginTop: '8px'
                        }}>
                            {stat.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div style={{
                ...cardStyle,
                padding: isMobile ? '16px' : '24px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div className="search-container">
                    <div style={{
                        flex: 1,
                        minWidth: isMobile ? '100%' : '300px',
                        position: 'relative'
                    }}>
                        <Search style={{
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#94a3b8'
                        }} size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '14px 20px 14px 48px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'white'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'center',
                        width: isMobile ? '100%' : 'auto'
                    }}>
                        <Filter size={18} color="#64748b" style={{ display: isMobile ? 'none' : 'block' }} />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                padding: '12px 20px',
                                boxSizing: 'border-box',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '14px',
                                outline: 'none',
                                backgroundColor: 'white',
                                cursor: 'pointer',
                                minWidth: '150px',
                                width: isMobile ? '100%' : 'auto',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#8b5cf6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="admin">Admins</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <LoadingScreen />
            ) : filteredUsers.length === 0 ? (
                <EmptyState />
            ) : (
                <div style={cardStyle}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <User size={20} />
                            User Accounts ({filteredUsers.length})
                        </h3>
                        <div style={{
                            fontSize: '14px',
                            color: '#64748b',
                            padding: '6px 12px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '20px'
                        }}>
                            Showing {filteredUsers.length} of {users.length} users
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="user-table">
                            <thead>
                                <tr style={{
                                    backgroundColor: '#f8fafc',
                                    borderBottom: '2px solid #e2e8f0'
                                }}>
                                    <th className="table-header">User</th>
                                    <th className="table-header">Role</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Joined</th>
                                    <th className="table-header" style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user, index) => {
                                    const isTargetAdmin = user.role === 'admin';
                                    const isSystemAdmin = user.email === "admin@example.com";
                                    const canIEdit = amISuperAdmin || !isTargetAdmin;
                                    const isRestricted = user.isBlocked || (user.restrictedUntil && new Date(user.restrictedUntil) > new Date());
                                    const isCurrentUser = user._id === loggedInUserId;

                                    return (
                                        <tr
                                            key={user._id}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'all 0.3s ease',
                                                animation: `slideIn 0.5s ease ${index * 0.05}s both`
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td className="table-cell">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '48px',
                                                        height: '48px',
                                                        borderRadius: '12px',
                                                        background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}80 100%)`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: '600',
                                                        fontSize: '18px',
                                                        position: 'relative'
                                                    }}>
                                                        {user.name ? user.name[0].toUpperCase() : <User size={20} />}
                                                        {isSystemAdmin && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '-4px',
                                                                right: '-4px',
                                                                background: '#f59e0b',
                                                                borderRadius: '50%',
                                                                padding: '2px'
                                                            }}>
                                                                <Crown size={12} color="white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                            <h4 style={{
                                                                fontSize: '16px',
                                                                fontWeight: '600',
                                                                color: '#1e293b'
                                                            }}>
                                                                {user.name}
                                                            </h4>
                                                            {isCurrentUser && (
                                                                <span style={{
                                                                    fontSize: '10px',
                                                                    fontWeight: '600',
                                                                    color: '#3b82f6',
                                                                    backgroundColor: '#eff6ff',
                                                                    padding: '2px 6px',
                                                                    borderRadius: '10px'
                                                                }}>
                                                                    You
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            fontSize: '14px',
                                                            color: '#64748b'
                                                        }}>
                                                            <Mail size={14} />
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: getRoleColor(user.role),
                                                    padding: '8px 12px',
                                                    backgroundColor: `${getRoleColor(user.role)}15`,
                                                    borderRadius: '8px',
                                                    width: 'fit-content'
                                                }}>
                                                    {user.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                                                    {user.role.toUpperCase()}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    color: getStatusColor(user),
                                                    padding: '8px 12px',
                                                    backgroundColor: `${getStatusColor(user)}15`,
                                                    borderRadius: '8px',
                                                    width: 'fit-content'
                                                }}>
                                                    {isRestricted ? <Ban size={14} /> : <CheckCircle size={14} />}
                                                    {isRestricted ? 'Restricted' : 'Active'}
                                                </div>
                                            </td>
                                            <td className="table-cell" style={{ fontSize: '14px', color: '#64748b' }}>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="table-cell">
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    gap: '8px'
                                                }}>
                                                    {canIEdit && !isCurrentUser ? (
                                                        <>
                                                            <button
                                                                onClick={() => { setCurrentUser(user); setEditModal(true); }}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #dbeafe',
                                                                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                                                                    color: '#3b82f6',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1) rotate(0)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <Edit3 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => restrictUser(user._id, isRestricted ? 0 : 24)}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    border: `1px solid ${isRestricted ? '#a7f3d0' : '#fed7aa'}`,
                                                                    background: isRestricted
                                                                        ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)'
                                                                        : 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                                                                    color: isRestricted ? '#059669' : '#d97706',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = `0 4px 12px ${isRestricted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`;
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                {isRestricted ? <CheckCircle size={18} /> : <Ban size={18} />}
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDelete(user)}
                                                                style={{
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    border: '1px solid #fee2e2',
                                                                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                                                                    color: '#dc2626',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1.1)';
                                                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = 'scale(1)';
                                                                    e.currentTarget.style.boxShadow = 'none';
                                                                }}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </>
                                                    ) : isCurrentUser ? (
                                                        <div style={{
                                                            padding: '8px 12px',
                                                            fontSize: '12px',
                                                            color: '#64748b',
                                                            backgroundColor: '#f1f5f9',
                                                            borderRadius: '8px',
                                                            fontWeight: '500'
                                                        }}>
                                                            Current Session
                                                        </div>
                                                    ) : (
                                                        <div style={{
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            backgroundColor: '#f1f5f9',
                                                            color: '#94a3b8',
                                                            cursor: 'not-allowed'
                                                        }}>
                                                            <Lock size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;