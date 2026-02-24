import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';
import { Tag, Calendar, Hash, Percent, IndianRupee, Save, Trash2, Edit } from 'lucide-react';
import Title from '../../components/common/Title';

const AddCoupon = () => {
    const [couponData, setCouponData] = useState({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: 0,
        expiryDate: '',
        usageLimit: 100,
        isActive: true
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchCoupons = async () => {
        try {
            const response = await API.get('/api/coupons/all');
            if (response.data.success) {
                setCoupons(response.data.coupons);
            }
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCouponData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (coupon) => {
        setCouponData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount,
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            usageLimit: coupon.usageLimit,
            isActive: coupon.isActive
        });
        setEditId(coupon._id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setCouponData({
            code: '',
            discountType: 'percentage',
            discountValue: '',
            minOrderAmount: 0,
            expiryDate: '',
            usageLimit: 100,
            isActive: true
        });
        setEditId(null);
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;
            if (isEditing) {
                response = await API.put(`/api/coupons/${editId}`, couponData);
            } else {
                response = await API.post('/api/coupons/create', couponData);
            }

            if (response.data.success) {
                toast.success(isEditing ? 'Coupon updated successfully!' : 'Coupon created successfully!');
                handleCancelEdit();
                fetchCoupons();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || (isEditing ? 'Failed to update coupon' : 'Failed to create coupon'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const response = await API.delete(`/api/coupons/${id}`);
            if (response.data.success) {
                toast.success("Coupon deleted");
                fetchCoupons();
                if (editId === id) handleCancelEdit();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const styles = {
        container: {
            padding: '1.5rem',
            maxWidth: '1280px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #0a0f1e 0%, #1a1f30 100%)',
            minHeight: '100vh',
        },
        header: {
            marginBottom: '2rem',
            textAlign: 'center',
        },
        titleWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
        },
        titleIcon: {
            color: '#fbbf24',
            fontSize: '2rem',
        },
        titleText: {
            fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
        },
        subtitle: {
            color: '#94a3b8',
            fontSize: 'clamp(0.875rem, 2vw, 1rem)',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
        },
        formCard: {
            background: '#0f1424',
            borderRadius: '1.5rem',
            padding: '2rem',
            border: '1px solid #2d3a5e',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
            position: 'sticky',
            top: '1rem',
            height: 'fit-content',
        },
        formHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            borderBottom: '1px solid #2d3a5e',
            paddingBottom: '0.75rem',
        },
        formTitle: {
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        cancelButton: {
            background: '#dc2626',
            color: '#fee2e2',
            border: 'none',
            padding: '0.375rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        inputWrapper: {
            marginBottom: '1.5rem',
        },
        label: {
            display: 'block',
            color: '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: '500',
            marginBottom: '0.5rem',
        },
        inputContainer: {
            position: 'relative',
        },
        inputIcon: {
            position: 'absolute',
            left: '0.75rem',
            top: '0.75rem',
            color: '#6b7280',
            width: '1.25rem',
            height: '1.25rem',
        },
        input: {
            width: '100%',
            padding: '0.75rem 0.75rem 0.75rem 2.5rem',
            background: '#1a1f35',
            boxSizing: 'border-box',
            border: '1px solid #4b5563',
            borderRadius: '0.75rem',
            color: 'white',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.3s ease',
        },
        inputUppercase: {
            textTransform: 'uppercase',
        },
        radioGroup: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
        },
        radioLabel: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#1a1f35',
            padding: '0.75rem',
            borderRadius: '0.75rem',
            border: '1px solid #2d3a5e',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        radioText: {
            color: '#94a3b8',
            fontSize: '0.875rem',
        },
        toggleContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#1a1f35',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: '1px solid #2d3a5e',
            marginBottom: '1.5rem',
        },
        toggle: {
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
        },
        toggleInput: {
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
        },
        toggleSlider: {
            width: '2.75rem',
            height: '1.5rem',
            background: '#374151',
            borderRadius: '1rem',
            transition: 'all 0.3s ease',
        },
        toggleSliderActive: {
            background: '#16a34a',
        },
        toggleKnob: {
            position: 'absolute',
            top: '0.125rem',
            left: '0.125rem',
            width: '1.25rem',
            height: '1.25rem',
            background: 'white',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
        },
        toggleKnobActive: {
            transform: 'translateX(1.25rem)',
        },
        toggleText: {
            color: '#94a3b8',
            fontSize: '0.875rem',
            fontWeight: '500',
        },
        submitButton: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            border: 'none',
            color: 'black',
            fontWeight: 'bold',
            padding: '1rem',
            borderRadius: '0.75rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '1rem',
            opacity: 1,
        },
        submitButtonDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed',
        },
        listCard: {
            background: '#0f1424',
            borderRadius: '1.5rem',
            border: '1px solid #2d3a5e',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        },
        listHeader: {
            padding: '1.5rem',
            borderBottom: '1px solid #2d3a5e',
            background: '#1a1f35',
        },
        listTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            fontSize: '1.25rem',
            fontWeight: '600',
        },
        badge: {
            background: '#2d3a5e',
            color: '#94a3b8',
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
        },
        tableContainer: {
            overflowX: 'auto',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px',
        },
        tableHead: {
            background: '#1a1f35',
            color: '#94a3b8',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
        },
        tableHeaderCell: {
            padding: '1rem',
            textAlign: 'left',
        },
        tableBody: {
            color: '#94a3b8',
        },
        tableRow: {
            borderBottom: '1px solid #2d3a5e',
            transition: 'background 0.3s ease',
        },
        tableCell: {
            padding: '1rem',
        },
        couponCode: {
            background: '#2d3a5e',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.375rem',
            color: '#fbbf24',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
        },
        restrictionText: {
            fontSize: '0.875rem',
            color: '#94a3b8',
        },
        statusBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            display: 'inline-block',
        },
        statusActive: {
            background: '#166534',
            color: '#86efac',
        },
        statusInactive: {
            background: '#7f1d1d',
            color: '#fca5a5',
        },
        actionButton: {
            background: 'transparent',
            border: 'none',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            margin: '0 0.25rem',
        },
        loadingContainer: {
            padding: '2.5rem',
            textAlign: 'center',
            color: '#94a3b8',
        },
        emptyContainer: {
            padding: '2.5rem',
            textAlign: 'center',
            color: '#94a3b8',
        },
        '@media (max-width: 768px)': {
            formCard: {
                position: 'relative',
                top: 0,
            },
            grid: {
                gap: '1rem',
            },
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.titleWrapper}>
                    <Tag style={styles.titleIcon} />
                    <h1 style={styles.titleText}>COUPON MANAGEMENT</h1>
                </div>
                <p style={styles.subtitle}>Create and manage discount coupons</p>
            </div>

            <div style={styles.grid}>
                {/* FORM SECTION */}
                <div>
                    <form onSubmit={handleSubmit} style={styles.formCard}>
                        <div style={styles.formHeader}>
                            <h3 style={styles.formTitle}>
                                <Tag color="#fbbf24" size={20} />
                                {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
                            </h3>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    style={styles.cancelButton}
                                    onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                                    onMouseLeave={(e) => e.target.style.background = '#dc2626'}
                                >
                                    Cancel Edit
                                </button>
                            )}
                        </div>

                        {/* Coupon Code */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Coupon Code</label>
                            <div style={styles.inputContainer}>
                                <Tag style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="code"
                                    value={couponData.code}
                                    onChange={handleChange}
                                    placeholder="e.g. JEWEL100"
                                    style={{ ...styles.input, ...styles.inputUppercase }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Expiry Date</label>
                            <div style={styles.inputContainer}>
                                <Calendar style={styles.inputIcon} />
                                <input
                                    type="date"
                                    name="expiryDate"
                                    value={couponData.expiryDate}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        {/* Discount Type */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Discount Type</label>
                            <div style={styles.radioGroup}>
                                <label
                                    style={{
                                        ...styles.radioLabel,
                                        borderColor: couponData.discountType === 'percentage' ? '#fbbf24' : '#2d3a5e'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = '#fbbf24'}
                                    onMouseLeave={(e) => e.target.style.borderColor = couponData.discountType === 'percentage' ? '#fbbf24' : '#2d3a5e'}
                                >
                                    <input
                                        type="radio"
                                        name="discountType"
                                        value="percentage"
                                        checked={couponData.discountType === 'percentage'}
                                        onChange={handleChange}
                                        style={{ accentColor: '#fbbf24' }}
                                    />
                                    <span style={styles.radioText}>Percentage</span>
                                </label>
                                <label
                                    style={{
                                        ...styles.radioLabel,
                                        borderColor: couponData.discountType === 'flat' ? '#fbbf24' : '#2d3a5e'
                                    }}
                                    onMouseEnter={(e) => e.target.style.borderColor = '#fbbf24'}
                                    onMouseLeave={(e) => e.target.style.borderColor = couponData.discountType === 'flat' ? '#fbbf24' : '#2d3a5e'}
                                >
                                    <input
                                        type="radio"
                                        name="discountType"
                                        value="flat"
                                        checked={couponData.discountType === 'flat'}
                                        onChange={handleChange}
                                        style={{ accentColor: '#fbbf24' }}
                                    />
                                    <span style={styles.radioText}>Flat (₹)</span>
                                </label>
                            </div>
                        </div>

                        {/* Discount Value */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Discount Value</label>
                            <div style={styles.inputContainer}>
                                {couponData.discountType === 'percentage' ? (
                                    <Percent style={styles.inputIcon} />
                                ) : (
                                    <IndianRupee style={styles.inputIcon} />
                                )}
                                <input
                                    type="number"
                                    name="discountValue"
                                    value={couponData.discountValue}
                                    onChange={handleChange}
                                    placeholder={couponData.discountType === 'percentage' ? "e.g. 10" : "e.g. 100"}
                                    style={styles.input}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Min Order Amount */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Min Order Amount (₹)</label>
                            <div style={styles.inputContainer}>
                                <IndianRupee style={styles.inputIcon} />
                                <input
                                    type="number"
                                    name="minOrderAmount"
                                    value={couponData.minOrderAmount}
                                    onChange={handleChange}
                                    placeholder="0"

                                    style={styles.input}
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Usage Limit */}
                        <div style={styles.inputWrapper}>
                            <label style={styles.label}>Usage Limit</label>
                            <div style={styles.inputContainer}>
                                <Hash style={styles.inputIcon} />
                                <input
                                    type="number"
                                    name="usageLimit"
                                    value={couponData.usageLimit}
                                    onChange={handleChange}
                                    placeholder="100"
                                    style={styles.input}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>

                        {/* Status Toggle */}
                        <div style={styles.toggleContainer}>
                            <label style={styles.toggle}>
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={couponData.isActive}
                                    onChange={handleChange}
                                    style={styles.toggleInput}
                                />
                                <span style={{
                                    ...styles.toggleSlider,
                                    ...(couponData.isActive ? styles.toggleSliderActive : {})
                                }} />
                                <span style={{
                                    ...styles.toggleKnob,
                                    ...(couponData.isActive ? styles.toggleKnobActive : {})
                                }} />
                            </label>
                            <span style={styles.toggleText}>Is Active</span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                ...styles.submitButton,
                                ...(loading ? styles.submitButtonDisabled : {})
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                            onMouseLeave={(e) => !loading && (e.target.style.transform = 'scale(1)')}
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    <Save size={20} />
                                    {isEditing ? 'Update Coupon' : 'Create Coupon'}
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* LIST SECTION */}
                <div>
                    <div style={styles.listCard}>
                        <div style={styles.listHeader}>
                            <h3 style={styles.listTitle}>
                                <Tag color="#fbbf24" size={20} />
                                Active Coupons <span style={styles.badge}>{coupons.length}</span>
                            </h3>
                        </div>

                        {fetching ? (
                            <div style={styles.loadingContainer}>Loading coupons...</div>
                        ) : coupons.length === 0 ? (
                            <div style={styles.emptyContainer}>No coupons found.</div>
                        ) : (
                            <div style={styles.tableContainer}>
                                <table style={styles.table}>
                                    <thead style={styles.tableHead}>
                                        <tr>
                                            <th style={styles.tableHeaderCell}>Code</th>
                                            <th style={styles.tableHeaderCell}>Discount</th>
                                            <th style={styles.tableHeaderCell}>Restriction</th>
                                            <th style={styles.tableHeaderCell}>Status</th>
                                            <th style={styles.tableHeaderCell} align="right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody style={styles.tableBody}>
                                        {coupons.map((coupon) => (
                                            <tr
                                                key={coupon._id}
                                                style={styles.tableRow}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(45, 58, 94, 0.5)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={styles.tableCell}>
                                                    <span style={styles.couponCode}>
                                                        {coupon.code}
                                                    </span>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    {coupon.discountType === 'percentage'
                                                        ? `${coupon.discountValue}% OFF`
                                                        : `₹${coupon.discountValue} OFF`}
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <div style={styles.restrictionText}>Min: ₹{coupon.minOrderAmount}</div>
                                                    <div style={styles.restrictionText}>Expr: {new Date(coupon.expiryDate).toLocaleDateString()}</div>
                                                    <div style={styles.restrictionText}>Limit: {coupon.usedCount}/{coupon.usageLimit}</div>
                                                </td>
                                                <td style={styles.tableCell}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        ...(coupon.isActive ? styles.statusActive : styles.statusInactive)
                                                    }}>
                                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td style={{ ...styles.tableCell, textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        style={styles.actionButton}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                                                            e.target.style.color = '#60a5fa';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'transparent';
                                                            e.target.style.color = '#94a3b8';
                                                        }}
                                                        title="Edit Coupon"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon._id)}
                                                        style={styles.actionButton}
                                                        onMouseEnter={(e) => {
                                                            e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                                                            e.target.style.color = '#f87171';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.target.style.background = 'transparent';
                                                            e.target.style.color = '#94a3b8';
                                                        }}
                                                        title="Delete Coupon"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCoupon;