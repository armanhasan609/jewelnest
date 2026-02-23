import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Edit, Eye, Star, MoreVertical, Search, Filter,
    TrendingUp, TrendingDown, Package, Tag, DollarSign,
    AlertCircle, CheckCircle, X, Grid, List, Download,
    ChevronUp, ChevronDown, Shield, Zap, Sparkles, AlertTriangle
} from 'lucide-react';

const ProductTable = ({ products, onDelete, onEdit, onBulkDelete }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
    const [showFilters, setShowFilters] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        minPrice: '',
        maxPrice: '',
        stockStatus: 'all',
        onSale: 'all',
        bestseller: 'all'
    });
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Get unique subCategories for filter
    const subCategories = ['all', ...new Set(products.map(p => p.subCategory))];

    // Helper function to get product image
    const getProductImage = (product) => {
        // Check if product has images array
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Return first image URL
            return product.images[0].url || product.images[0];
        }
        // Check if product has single image field
        else if (product.image) {
            return product.image;
        }
        // Return default placeholder
        return 'https://placehold.co/300x300?text=No+Image';
    };

    // Apply advanced filters
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Basic search filter
            const matchesSearch = searchTerm === '' ||
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());

            // Category filter
            const matchesCategory = selectedCategory === 'all' || product.subCategory === selectedCategory;

            // Advanced filters
            const matchesMinPrice = !advancedFilters.minPrice || product.price >= Number(advancedFilters.minPrice);
            const matchesMaxPrice = !advancedFilters.maxPrice || product.price <= Number(advancedFilters.maxPrice);

            const matchesStock = advancedFilters.stockStatus === 'all' ||
                (advancedFilters.stockStatus === 'inStock' && product.stock > 0) ||
                (advancedFilters.stockStatus === 'outOfStock' && product.stock <= 0) ||
                (advancedFilters.stockStatus === 'lowStock' && product.stock > 0 && product.stock <= 10);

            const matchesSale = advancedFilters.onSale === 'all' ||
                (advancedFilters.onSale === 'sale' && product.onSale) ||
                (advancedFilters.onSale === 'noSale' && !product.onSale);

            const matchesBestseller = advancedFilters.bestseller === 'all' ||
                (advancedFilters.bestseller === 'bestseller' && product.bestseller) ||
                (advancedFilters.bestseller === 'notBestseller' && !product.bestseller);

            return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice &&
                matchesStock && matchesSale && matchesBestseller;
        });
    }, [products, searchTerm, selectedCategory, advancedFilters]);

    // Sort products
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'name' || sortBy === 'subCategory') {
                aValue = (aValue || '').toLowerCase();
                bValue = (bValue || '').toLowerCase();
            }

            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [filteredProducts, sortBy, sortOrder]);

    // Calculate statistics
    const stats = useMemo(() => {
        return {
            total: filteredProducts.length,
            totalValue: filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
            averagePrice: filteredProducts.length > 0 ?
                filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length : 0,
            lowStock: filteredProducts.filter(p => p.stock > 0 && p.stock <= 10).length,
            onSale: filteredProducts.filter(p => p.onSale).length,
            bestsellers: filteredProducts.filter(p => p.bestseller).length
        };
    }, [filteredProducts]);

    // Handle product selection
    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            } else {
                return [...prev, productId];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedProducts.length === sortedProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(sortedProducts.map(p => p._id));
        }
    };

    const handleBulkDelete = async () => {
        setDeleteLoading(true);
        try {
            await onBulkDelete(selectedProducts);
            setSelectedProducts([]);
            setShowDeleteConfirm(false);
            setShowBulkActions(false);
        } catch (error) {
            console.error('Bulk delete failed:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Export to CSV
    const exportToCSV = () => {
        const headers = ['Name', 'Sub Category', 'Price', 'Stock', 'Status', 'Bestseller', 'On Sale', 'SKU'];
        const csvData = sortedProducts.map(product => [
            product.name,
            product.subCategory,
            product.price,
            product.stock,
            product.stock > 0 ? 'In Stock' : 'Out of Stock',
            product.bestseller ? 'Yes' : 'No',
            product.onSale ? 'Yes' : 'No',
            product.sku || 'N/A'
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Container Styles
    const containerStyle = {
        width: '100%',
        maxWidth: isMobile ? '100%' : 'calc(100vw - 300px)', // Account for sidebar width
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        animation: 'slideIn 0.5s ease',
        margin: '0 auto'
    };

    // Statistics Cards
    const StatsCard = ({ title, value, icon: Icon, color, change }) => (
        <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '12px',
            borderRadius: '12px',
            border: `1px solid ${color}20`,
            minWidth: '140px',
            flex: '1 1 140px',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 40px ${color}15`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{
                    padding: '10px',
                    borderRadius: '12px',
                    background: `${color}15`,
                    color: color
                }}>
                    <Icon size={20} />
                </div>
                {change && (
                    <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: change > 0 ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>{title}</div>
            <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
            }}>
                {title.includes('Value') ? `₹${value.toLocaleString()}` : value}
            </div>
        </div>
    );

    // Category badge with better styling
    const CategoryBadge = ({ category }) => {
        const categoryColors = {
            'Gold': { background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', color: '#92400e' },
            'Diamond': { background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', color: '#3730a3' },
            'Silver': { background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', color: '#374151' },
            'Platinum': { background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', color: '#5b21b6' },
            'Gemstones': { background: 'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)', color: '#9d174d' },
            'default': { background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', color: '#475569' }
        };

        return (
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                background: categoryColors[category]?.background || categoryColors.default.background,
                color: categoryColors[category]?.color || categoryColors.default.color,
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
            }}>
                {category}
            </div>
        );
    };

    // Stock indicator
    const StockIndicator = ({ stock }) => {
        if (stock <= 0) {
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                }}>
                    <AlertCircle size={10} /> Out of Stock
                </div>
            );
        } else if (stock <= 10) {
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                }}>
                    <AlertCircle size={10} /> Low Stock
                </div>
            );
        } else {
            return (
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600'
                }}>
                    <CheckCircle size={10} /> In Stock
                </div>
            );
        }
    };

    // Handle sort
    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Table View
    const TableView = () => (
        <div style={{ overflowX: 'auto', position: 'relative' }}>
            <table style={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                minWidth: '1000px'
            }}>
                <thead style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    position: 'sticky',
                    top: '0',
                    zIndex: '10'
                }}>
                    <tr>
                        <th style={{
                            padding: '16px 20px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            borderBottom: '2px solid #e2e8f0',
                            width: '40px'
                        }}>
                            <input
                                type="checkbox"
                                checked={selectedProducts.length === sortedProducts.length && sortedProducts.length > 0}
                                onChange={handleSelectAll}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    accentColor: '#b8860b'
                                }}
                            />
                        </th>
                        {[
                            { key: 'name', label: 'Product', width: '35%' },
                            { key: 'subCategory', label: 'Sub Category', width: '15%' },
                            { key: 'price', label: 'Price', width: '15%' },
                            { key: 'stock', label: 'Status', width: '15%' },
                            { key: 'actions', label: 'Actions', width: '20%' }
                        ].map((column) => (
                            <th
                                key={column.key}
                                style={{
                                    padding: '16px 20px',
                                    textAlign: 'left',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#64748b',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    borderBottom: '2px solid #e2e8f0',
                                    width: column.width,
                                    cursor: column.key !== 'actions' ? 'pointer' : 'default',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => column.key !== 'actions' && (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                                onMouseLeave={(e) => column.key !== 'actions' && (e.currentTarget.style.backgroundColor = 'transparent')}
                                onClick={() => column.key !== 'actions' && handleSort(column.key)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {column.label}
                                    {sortBy === column.key && column.key !== 'actions' && (
                                        <div style={{
                                            color: '#b8860b',
                                            animation: 'pulse 2s infinite'
                                        }}>
                                            {sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </div>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedProducts.map((product, index) => (
                        <tr
                            key={product._id}
                            style={{
                                transition: 'all 0.3s ease',
                                animation: `slideIn 0.5s ease ${index * 0.05}s both`,
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }}
                        >
                            {/* Checkbox */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product._id)}
                                    onChange={() => handleSelectProduct(product._id)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        accentColor: '#b8860b'
                                    }}
                                />
                            </td>

                            {/* Product */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        background: '#f1f5f9',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <img
                                            src={getProductImage(product)}
                                            alt={product.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'transform 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            onError={(e) => {
                                                e.target.src = 'https://placehold.co/300x300?text=No+Image';
                                            }}
                                        />
                                        {product.onSale && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                left: '8px',
                                                backgroundColor: '#ef4444',
                                                color: 'white',
                                                fontSize: '10px',
                                                fontWeight: '700',
                                                padding: '2px 6px',
                                                borderRadius: '10px',
                                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                                            }}>
                                                SALE
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <h3 style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                margin: '0'
                                            }}>
                                                {product.name}
                                            </h3>
                                            {product.bestseller && (
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '2px',
                                                    backgroundColor: '#fef3c7',
                                                    color: '#92400e',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '10px',
                                                    fontWeight: '700'
                                                }}>
                                                    <Star size={10} fill="#fbbf24" /> TOP
                                                </div>
                                            )}
                                        </div>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#64748b',
                                            margin: '0 0 8px 0',
                                            lineHeight: '1.4',
                                            maxWidth: '400px',
                                            display: '-webkit-box',
                                            WebkitLineClamp: '2',
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {product.description || 'No description available'}
                                        </p>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                            SKU: {product.sku || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Sub Category */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <CategoryBadge category={product.subCategory} />
                            </td>

                            {/* Price */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        ₹{product.price?.toLocaleString()}
                                    </div>
                                    {product.originalPrice && product.originalPrice > product.price && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#ef4444',
                                            textDecoration: 'line-through',
                                            marginTop: '2px'
                                        }}>
                                            ₹{product.originalPrice.toLocaleString()}
                                        </div>
                                    )}
                                    {product.onSale && product.salePrice && (
                                        <div style={{
                                            fontSize: '12px',
                                            color: '#10b981',
                                            fontWeight: '600',
                                            marginTop: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '2px'
                                        }}>
                                            <TrendingDown size={12} />
                                            Sale: ₹{product.salePrice.toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </td>

                            {/* Stock Status */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <StockIndicator stock={product.stock} />
                                    <div style={{ fontSize: '13px', color: '#475569' }}>
                                        {product.stock} units
                                    </div>
                                </div>
                            </td>

                            {/* Actions */}
                            <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => navigate(`/admin/edit/${product._id}`)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        title="Edit Product"
                                    >
                                        <Edit size={16} />
                                    </button>

                                    <button
                                        onClick={() => window.open(`/product/${product._id}`, '_blank')}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        title="View Product"
                                    >
                                        <Eye size={16} />
                                    </button>

                                    <button
                                        onClick={() => onDelete(product._id)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                            color: 'white',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.1)';
                                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        title="Delete Product"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Grid View
    const GridView = () => (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
            padding: '24px'
        }}>
            {sortedProducts.map((product, index) => (
                <div
                    key={product._id}
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '20px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        animation: `slideIn 0.5s ease ${index * 0.05}s both`
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {/* Product Image */}
                    <div style={{
                        height: '200px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <img
                            src={getProductImage(product)}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/300x300?text=No+Image';
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '12px',
                            display: 'flex',
                            gap: '8px',
                            flexDirection: 'column'
                        }}>
                            {product.onSale && (
                                <div style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                                }}>
                                    SALE
                                </div>
                            )}
                            {product.bestseller && (
                                <div style={{
                                    backgroundColor: '#fbbf24',
                                    color: '#92400e',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)'
                                }}>
                                    <Star size={10} fill="#92400e" /> BESTSELLER
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#1e293b',
                                margin: '0',
                                flex: '1',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}>
                                {product.name}
                            </h3>
                            <div style={{
                                fontSize: '18px',
                                fontWeight: '800',
                                background: 'linear-gradient(135deg, #b8860b 0%, #a4710a 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                ₹{product.price?.toLocaleString()}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <CategoryBadge category={product.subCategory} />
                            <StockIndicator stock={product.stock} />
                        </div>

                        <p style={{
                            fontSize: '13px',
                            color: '#64748b',
                            margin: '0 0 20px 0',
                            lineHeight: '1.5',
                            display: '-webkit-box',
                            WebkitLineClamp: '3',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {product.description || 'No description available'}
                        </p>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => navigate(`/admin/edit/${product._id}`)}
                                style={{
                                    flex: '1',
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Edit size={14} /> Edit
                            </button>

                            <button
                                onClick={() => onDelete(product._id)}
                                style={{
                                    width: '40px',
                                    padding: '10px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={containerStyle}>
            {/* CSS Animations */}
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
            }}>
                <div>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #b8860b 0%, #a4710a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: '0 0 8px 0'
                    }}>
                        Product Inventory
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                        Manage your product catalog efficiently
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            padding: '8px 16px',
                            background: showFilters ? '#b8860b' : '#f1f5f9',
                            color: showFilters ? 'white' : '#475569',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            if (!showFilters) {
                                e.currentTarget.style.background = '#e2e8f0';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!showFilters) {
                                e.currentTarget.style.background = '#f1f5f9';
                            }
                        }}
                    >
                        <Filter size={16} />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    <button
                        onClick={exportToCSV}
                        style={{
                            padding: '8px 16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: '600',
                            fontSize: '13px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Download size={16} /> Export CSV
                    </button>

                    <div style={{
                        display: 'flex',
                        background: '#f1f5f9',
                        borderRadius: '10px',
                        overflow: 'hidden'
                    }}>
                        <button
                            onClick={() => setViewMode('table')}
                            style={{
                                padding: '8px 16px',
                                background: viewMode === 'table' ? '#b8860b' : 'transparent',
                                color: viewMode === 'table' ? 'white' : '#475569',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <List size={16} /> Table
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            style={{
                                padding: '8px 16px',
                                background: viewMode === 'grid' ? '#b8860b' : 'transparent',
                                color: viewMode === 'grid' ? 'white' : '#475569',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Grid size={16} /> Grid
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                overflowX: 'auto'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '6px',
                    scrollbarWidth: 'thin'
                }}>
                    <StatsCard title="Total Products" value={stats.total} icon={Package} color="#3b82f6" change={+12} />
                    <StatsCard title="Total Value" value={stats.totalValue} icon={DollarSign} color="#10b981" change={+8} />
                    <StatsCard title="Average Price" value={stats.averagePrice.toFixed(2)} icon={Tag} color="#8b5cf6" change={-3} />
                    <StatsCard title="Low Stock" value={stats.lowStock} icon={AlertCircle} color="#f59e0b" change={+15} />
                    <StatsCard title="On Sale" value={stats.onSale} icon={TrendingDown} color="#ef4444" change={+25} />
                    <StatsCard title="Bestsellers" value={stats.bestsellers} icon={Star} color="#fbbf24" change={+18} />
                </div>
            </div>

            {/* Search and Filters */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                background: 'white',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: showFilters ? '16px' : '0',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                        <Search
                            size={18}
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#94a3b8'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '12px 16px 12px 44px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '10px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                backgroundColor: 'white'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#b8860b';
                                e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            boxSizing: 'border-box',
                            border: '2px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '14px',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            minWidth: '160px'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#b8860b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(184, 134, 11, 0.1)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <option value="all">All Sub Categories</option>
                        {subCategories.filter(cat => cat !== 'all' && cat).map((category, index) => (
                            <option key={category || index} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        animation: 'slideIn 0.3s ease'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '12px',
                            marginBottom: '12px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '8px'
                                }}>Min Price</label>
                                <input
                                    type="number"
                                    placeholder="₹ Min"
                                    value={advancedFilters.minPrice}
                                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, minPrice: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '8px'
                                }}>Max Price</label>
                                <input
                                    type="number"
                                    placeholder="₹ Max"
                                    value={advancedFilters.maxPrice}
                                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxPrice: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '8px'
                                }}>Stock Status</label>
                                <select
                                    value={advancedFilters.stockStatus}
                                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, stockStatus: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Stock</option>
                                    <option value="inStock">In Stock</option>
                                    <option value="lowStock">Low Stock</option>
                                    <option value="outOfStock">Out of Stock</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '8px'
                                }}>Sale Status</label>
                                <select
                                    value={advancedFilters.onSale}
                                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, onSale: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Products</option>
                                    <option value="sale">On Sale</option>
                                    <option value="noSale">Not on Sale</option>
                                </select>
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: '#64748b',
                                    marginBottom: '8px'
                                }}>Bestseller</label>
                                <select
                                    value={advancedFilters.bestseller}
                                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, bestseller: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        backgroundColor: 'white',
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="all">All Products</option>
                                    <option value="bestseller">Bestsellers</option>
                                    <option value="notBestseller">Not Bestsellers</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button
                                onClick={() => setAdvancedFilters({
                                    minPrice: '',
                                    maxPrice: '',
                                    stockStatus: 'all',
                                    onSale: 'all',
                                    bestseller: 'all'
                                })}
                                style={{
                                    padding: '8px 16px',
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk Actions Bar */}
            {selectedProducts.length > 0 && (
                <div style={{
                    padding: '12px 20px',
                    background: 'linear-gradient(135deg, #b8860b 0%, #a4710a 100%)',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    animation: 'slideIn 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield size={20} />
                        <span style={{ fontWeight: '600' }}>
                            {selectedProducts.length} product{selectedProducts.length > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setShowBulkActions(!showBulkActions)}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <MoreVertical size={16} /> Actions
                        </button>
                        <button
                            onClick={() => {
                                setSelectedProducts([]);
                                setShowBulkActions(false);
                            }}
                            style={{
                                padding: '8px 16px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions Menu */}
            {showBulkActions && selectedProducts.length > 0 && (
                <div style={{
                    padding: '12px 20px',
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    animation: 'slideIn 0.3s ease'
                }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <Trash2 size={16} /> Delete Selected
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {sortedProducts.length > 0 ? (
                viewMode === 'table' ? <TableView /> : <GridView />
            ) : (
                <div style={{
                    padding: '80px 32px',
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}>
                    <div style={{
                        width: '100px',
                        height: '100px',
                        margin: '0 auto 24px',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            right: '0',
                            bottom: '0',
                            border: '4px solid #e2e8f0',
                            borderRadius: '50%',
                            borderTopColor: '#b8860b',
                            animation: 'spin 2s linear infinite'
                        }} />
                        <Search
                            size={40}
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: '#94a3b8'
                            }}
                        />
                    </div>
                    <h3 style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '12px'
                    }}>
                        {searchTerm || selectedCategory !== 'all' || Object.values(advancedFilters).some(v => v && v !== 'all')
                            ? 'No Products Found'
                            : 'Inventory Empty'
                        }
                    </h3>
                    <p style={{
                        fontSize: '16px',
                        color: '#64748b',
                        maxWidth: '500px',
                        margin: '0 auto 32px',
                        lineHeight: '1.6'
                    }}>
                        {searchTerm || selectedCategory !== 'all' || Object.values(advancedFilters).some(v => v && v !== 'all')
                            ? 'No products match your search criteria. Try adjusting your filters or search terms.'
                            : 'Start building your product catalog by adding your first product.'
                        }
                    </p>
                    {(searchTerm || selectedCategory !== 'all' || Object.values(advancedFilters).some(v => v && v !== 'all')) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                                setAdvancedFilters({
                                    minPrice: '',
                                    maxPrice: '',
                                    stockStatus: 'all',
                                    onSale: 'all',
                                    bestseller: 'all'
                                });
                                setShowFilters(false);
                            }}
                            style={{
                                padding: '12px 32px',
                                background: 'linear-gradient(135deg, #b8860b 0%, #a4710a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(184, 134, 11, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <X size={18} /> Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Footer Stats */}
            <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
            }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing <strong>{sortedProducts.length}</strong> of <strong>{filteredProducts.length}</strong> products
                    {searchTerm && (
                        <span> for "<strong>{searchTerm}</strong>"</span>
                    )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} color="#b8860b" />
                    <span>Total Inventory Value: <strong>₹{stats.totalValue.toLocaleString()}</strong></span>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div style={{
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    bottom: '0',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                        borderRadius: '20px',
                        padding: '32px',
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
                                    Delete {selectedProducts.length} Product{selectedProducts.length > 1 ? 's' : ''}
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
                            Are you sure you want to permanently delete {selectedProducts.length} selected product{selectedProducts.length > 1 ? 's' : ''}?
                            All associated data will be removed from the system.
                        </p>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setShowBulkActions(false);
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
                                onClick={handleBulkDelete}
                                disabled={deleteLoading}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: deleteLoading ? 'not-allowed' : 'pointer',
                                    opacity: deleteLoading ? 0.7 : 1,
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                {deleteLoading ? (
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
                                        Delete {selectedProducts.length} Product{selectedProducts.length > 1 ? 's' : ''}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductTable;