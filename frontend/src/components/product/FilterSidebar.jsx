import React, { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../../context/ShopContext';

const FilterSidebar = ({ toggleCategory, onPriceChange, initialPriceRange = [0, 50000] }) => {
    const { subCategories } = useContext(ShopContext);

    const sidebarContainerStyle = {
        padding: 'clamp(20px, 3vw, 28px)',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        borderRadius: '20px',
        boxShadow: '15px 15px 30px #d1d9e6, -15px -15px 30px #ffffff',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        minWidth: '280px',
        width: '100%',
        maxWidth: '320px',
        height: 'fit-content',
        position: 'sticky',
        top: 'clamp(20px, 3vw, 28px)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        animation: 'slideInLeft 0.6s ease-out'
    };

    const titleStyle = {
        fontSize: 'clamp(20px, 2.5vw, 24px)',
        fontWeight: '800',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e2e8f0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        letterSpacing: '-0.5px'
    };

    const categoryContainerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '8px'
    };

    // Scrollbar styling
    const scrollbarStyle = {
        '&::-webkit-scrollbar': {
            width: '6px'
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
            borderRadius: '3px'
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '3px'
        }
    };

    const categoryItemStyle = (category, isChecked) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: 'clamp(12px, 1.5vw, 16px) clamp(16px, 2vw, 20px)',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        background: isChecked
            ? `${category.color}15`
            : hoveredCategory === category.name
                ? '#f8fafc'
                : 'transparent',
        border: `2px solid ${isChecked ? category.color + '40' : '#e2e8f0'}`,
        transform: hoveredCategory === category.name && !isChecked ? 'translateX(8px)' : 'translateX(0)',
        position: 'relative',
        overflow: 'hidden'
    });

    const categoryIconStyle = (category) => ({
        width: 'clamp(36px, 3vw, 44px)',
        height: 'clamp(36px, 3vw, 44px)',
        borderRadius: '12px',
        background: category.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'clamp(16px, 2vw, 20px)',
        color: 'white',
        fontWeight: '600',
        boxShadow: `0 4px 12px ${category.color}40`,
        transition: 'all 0.3s ease',
        flexShrink: 0
    });

    const categoryInfoStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
        minWidth: 0
    };

    const categoryLabelStyle = (isChecked, category) => ({
        fontSize: 'clamp(14px, 1.5vw, 16px)',
        fontWeight: isChecked ? '700' : '600',
        color: isChecked ? category.color : '#4b5563',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    });

    const categoryCountStyle = (isChecked, category) => ({
        fontSize: 'clamp(12px, 1.5vw, 14px)',
        fontWeight: '600',
        color: isChecked ? category.color : '#9ca3af',
        backgroundColor: isChecked ? `${category.color}10` : '#f1f5f9',
        padding: '4px 12px',
        borderRadius: '12px',
        minWidth: '36px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        border: `1px solid ${isChecked ? category.color + '20' : '#e5e7eb'}`
    });

    const checkboxStyle = (isChecked, category) => ({
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: `2px solid ${isChecked ? category.color : '#d1d5db'}`,
        backgroundColor: isChecked ? category.color : 'white',
        cursor: 'pointer',
        appearance: 'none',
        position: 'relative',
        transition: 'all 0.3s ease',
        margin: '0',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isChecked ? `0 4px 12px ${category.color}40` : 'none'
    });

    const handleCategoryClick = (categoryName) => {
        const event = {
            target: {
                value: categoryName,
                checked: !activeFilters.includes(categoryName)
            }
        };
        toggleCategory(event);
        if (activeFilters.includes(categoryName)) {
            setActiveFilters(prev => prev.filter(c => c !== categoryName));
        } else {
            setActiveFilters(prev => [...prev, categoryName]);
        }
    };

    const handleClearFilters = () => {
        setActiveFilters([]);
        setPriceRange(initialPriceRange);
        setPriceInputs({ min: initialPriceRange[0], max: initialPriceRange[1] });
        if (onPriceChange) {
            onPriceChange(initialPriceRange);
        }
    };

    const handlePriceChange = (values) => {
        setPriceRange(values);
        setPriceInputs({ min: values[0], max: values[1] });
        if (onPriceChange) {
            onPriceChange(values);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div style={sidebarContainerStyle}>
            {/* Header */}
            <div style={titleStyle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#667eea" />
                            <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                    </defs>
                    <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </div>

            {/* Active Filters Count */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #667eea10, #764ba210)',
                borderRadius: '12px',
                border: '1px solid #667eea20'
            }}>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '700'
                    }}>
                        {activeFilters.length}
                    </span>
                    Active Filters
                </span>
                {activeFilters.length > 0 && (
                    <button
                        onClick={handleClearFilters}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Clear All
                    </button>
                )}
            </div>

            {/* Categories Section */}
            <div style={{
                marginBottom: '28px',
                paddingBottom: '24px',
                borderBottom: '2px solid #e2e8f0'
            }}>
                <h3 style={{
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                        <path d="M19 11H5M19 11a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Sub Categories
                </h3>
                <div style={categoryContainerStyle}>
                    {(subCategories || []).map((category) => {
                        const isChecked = activeFilters.includes(category.name);
                        // Using a default color since we removed categoryData
                        const defaultColor = '#3b82f6';

                        return (
                            <div
                                key={category._id || category.name}
                                style={categoryItemStyle({ ...category, color: defaultColor }, isChecked)}
                                onClick={() => handleCategoryClick(category.name)}
                                onMouseEnter={() => setHoveredCategory(category.name)}
                                onMouseLeave={() => setHoveredCategory(null)}
                            >
                                <div style={{ ...categoryIconStyle({ ...category, color: defaultColor, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' }) }}>
                                    💎
                                </div>

                                <div style={categoryInfoStyle}>
                                    <span style={categoryLabelStyle(isChecked, { ...category, color: defaultColor })}>
                                        {category.name}
                                    </span>
                                </div>

                                <input
                                    type="checkbox"
                                    value={category.name}
                                    checked={isChecked}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleCategoryClick(category.name);
                                    }}
                                    style={checkboxStyle(isChecked, { ...category, color: defaultColor })}
                                />
                            </div>
                        );
                    })}
                    {(!subCategories || subCategories.length === 0) && (
                        <p style={{ color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>No sub categories found</p>
                    )}
                </div>
            </div>

            {/* Price Range Filter */}
            <div style={{
                marginBottom: '28px',
                paddingBottom: '24px',
                borderBottom: '2px solid #e2e8f0'
            }}>
                <h3 style={{
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                        <path d="M12 1v22M5 18h2a2 2 0 002-2v-2a2 2 0 00-2-2H5a2 2 0 00-2 2v2a2 2 0 002 2zM17 6h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V8a2 2 0 012-2z" />
                    </svg>
                    Price Range
                </h3>

                <div style={{
                    background: 'linear-gradient(145deg, #f8fafc, #ffffff)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: 'inset 5px 5px 10px #e2e8f0, inset -5px -5px 10px #ffffff'
                }}>
                    {/* Price Inputs */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Min
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '12px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={priceInputs.min}
                                    onChange={(e) => {
                                        const newMin = parseInt(e.target.value) || 0;
                                        if (newMin <= priceInputs.max) {
                                            handlePriceChange([newMin, priceInputs.max]);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 28px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        background: 'white',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94a3b8',
                            fontWeight: '600',
                            marginTop: '24px'
                        }}>
                            -
                        </div>

                        <div style={{ flex: 1 }}>
                            <label style={{
                                display: 'block',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Max
                            </label>
                            <div style={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    position: 'absolute',
                                    left: '12px',
                                    color: '#64748b',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}>
                                    ₹
                                </span>
                                <input
                                    type="number"
                                    value={priceInputs.max}
                                    onChange={(e) => {
                                        const newMax = parseInt(e.target.value) || initialPriceRange[1];
                                        if (newMax >= priceInputs.min) {
                                            handlePriceChange([priceInputs.min, newMax]);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px 10px 10px 28px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        background: 'white',
                                        transition: 'all 0.3s ease',
                                        outline: 'none'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#667eea';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Range Slider */}
                    <div style={{ position: 'relative', height: '40px', marginTop: '10px' }}>
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '0',
                            right: '0',
                            height: '6px',
                            background: 'linear-gradient(90deg, #e2e8f0, #cbd5e1)',
                            borderRadius: '3px',
                            transform: 'translateY(-50%)'
                        }} />

                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: `${(priceRange[0] / initialPriceRange[1]) * 100}%`,
                            right: `${100 - (priceRange[1] / initialPriceRange[1]) * 100}%`,
                            height: '6px',
                            background: 'linear-gradient(90deg, #667eea, #764ba2)',
                            borderRadius: '3px',
                            transform: 'translateY(-50%)'
                        }} />

                        {/* Min Handle */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: `${(priceRange[0] / initialPriceRange[1]) * 100}%`,
                                width: '20px',
                                height: '20px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                border: '3px solid white',
                                transition: 'all 0.3s ease',
                                zIndex: 2
                            }}
                            onMouseDown={() => {/* Add drag logic */ }}
                        />

                        {/* Max Handle */}
                        <div
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: `${(priceRange[1] / initialPriceRange[1]) * 100}%`,
                                width: '20px',
                                height: '20px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                border: '3px solid white',
                                transition: 'all 0.3s ease',
                                zIndex: 2
                            }}
                            onMouseDown={() => {/* Add drag logic */ }}
                        />
                    </div>

                    {/* Price Display */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '20px',
                        padding: '12px',
                        background: 'rgba(102, 126, 234, 0.05)',
                        borderRadius: '10px',
                        border: '1px solid rgba(102, 126, 234, 0.1)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '4px'
                            }}>
                                MIN PRICE
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#667eea'
                            }}>
                                {formatCurrency(priceRange[0])}
                            </div>
                        </div>
                        <div style={{
                            width: '1px',
                            background: 'linear-gradient(to bottom, transparent, #cbd5e1, transparent)',
                            margin: '0 10px'
                        }} />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                color: '#64748b',
                                marginBottom: '4px'
                            }}>
                                MAX PRICE
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#764ba2'
                            }}>
                                {formatCurrency(priceRange[1])}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Filters Preview */}
            {activeFilters.length > 0 && (
                <div style={{
                    marginTop: '24px',
                    padding: '20px',
                    background: 'linear-gradient(135deg, #667eea10, #764ba210)',
                    borderRadius: '16px',
                    border: '1px solid #667eea20'
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667eea" strokeWidth="2">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                        </svg>
                        Active Filters
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        {activeFilters.map(filter => {
                            // Fallback category object since categoryData is gone
                            const category = {
                                gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                icon: '💎'
                            };
                            return (
                                <div
                                    key={filter}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        background: category?.gradient || 'linear-gradient(135deg, #667eea, #764ba2)',
                                        borderRadius: '20px',
                                        color: 'white',
                                        fontSize: '13px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {category?.icon}
                                    {filter}
                                    <button
                                        onClick={() => handleCategoryClick(filter)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'none';
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>{`
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                }

                ::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 3px;
                }

                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    border-radius: 3px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #5a6fd8, #68428f);
                }

                /* Focus styles */
                input:focus, button:focus {
                    outline: 2px solid rgba(102, 126, 234, 0.5);
                    outline-offset: 2px;
                }

                /* Checkbox checkmark */
                input[type="checkbox"]:checked:after {
                    content: "✓";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                }
            `}</style>
        </div>
    );
};

export default FilterSidebar;