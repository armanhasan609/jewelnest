import React, { useEffect, useState } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Analytics = () => {
    const [stats, setStats] = useState({
        revenue: [],
        labels: [],
        orders: [],
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topCategories: []
    });

    const [timeRange, setTimeRange] = useState('monthly');
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                toast.error("Please login to view analytics");
                return;
            }

            const res = await axios.get(`/api/orders/stats?range=${timeRange}`, {
                headers: { token }
            });

            if (res.data.success) {
                const data = res.data.stats;
                setStats({
                    revenue: data.revenue || [],
                    labels: data.labels || [],
                    orders: data.orders || [],
                    totalSales: data.totalSales || 0,
                    totalOrders: data.totalOrders || 0,
                    averageOrderValue: data.averageOrderValue || 0,
                    topCategories: data.topCategories || []
                });
            }
        } catch (err) {
            console.error("Analytics Error:", err);
            toast.error("Database connection failed for stats");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    // Chart Data Configurations
    const revenueData = {
        labels: stats.labels,
        datasets: [{
            label: 'Revenue (₹)',
            data: stats.revenue,
            fill: true,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5
        }]
    };

    const ordersData = {
        labels: stats.labels,
        datasets: [{
            label: 'Number of Orders',
            data: stats.orders,
            backgroundColor: '#10b981',
            borderRadius: 6,
            borderSkipped: false
        }]
    };

    const categoryData = {
        labels: stats.topCategories.map(c => c.category),
        datasets: [{
            data: stats.topCategories.map(c => c.revenue),
            backgroundColor: ['#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#84cc16', '#06b6d4'],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 15
        }]
    };

    // Chart Options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 20,
                    usePointStyle: true
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 13 },
                padding: 12,
                cornerRadius: 8,
                displayColors: true
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: { size: 11 }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: { size: 11 }
                }
            }
        }
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y: {
                ...chartOptions.scales.y,
                ticks: {
                    callback: function (value) {
                        return value;
                    }
                }
            }
        }
    };

    const doughnutOptions = {
        ...chartOptions,
        plugins: {
            ...chartOptions.plugins,
            tooltip: {
                ...chartOptions.plugins.tooltip,
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                    }
                }
            }
        }
    };

    const containerStyle = {
        padding: '24px',
        backgroundColor: '#f9fafb',
        minHeight: '100vh'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
    };

    const titleStyle = {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1a202c',
        letterSpacing: '-0.025em'
    };

    const timeRangeStyle = {
        display: 'flex',
        gap: '8px',
        backgroundColor: 'white',
        padding: '6px',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
    };

    const timeRangeButtonStyle = (range) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: timeRange === range ? '#1a202c' : 'transparent',
        color: timeRange === range ? 'white' : '#6b7280',
        textTransform: 'capitalize'
    });

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
    };

    const statCardStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6',
        borderLeft: '4px solid',
        transition: 'all 0.3s ease'
    };

    const chartContainerStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6',
        marginBottom: '24px'
    };

    const chartTitleStyle = {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '20px'
    };

    const loadingStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 20px',
        textAlign: 'center'
    };

    const loadingSpinnerStyle = {
        width: '60px',
        height: '60px',
        border: '4px solid #f3f4f6',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
    };

    const chartWrapperStyle = {
        height: '300px',
        position: 'relative'
    };

    const categoryBreakdownStyle = {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        border: '1px solid #f3f4f6'
    };

    const categoryItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderRadius: '12px',
        transition: 'all 0.3s ease',
        marginBottom: '8px'
    };

    if (loading) {
        return (
            <div style={loadingStyle}>
                <div style={loadingSpinnerStyle}></div>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#4b5563',
                    marginBottom: '8px'
                }}>
                    Loading Business Analytics...
                </h3>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    maxWidth: '400px'
                }}>
                    Fetching your business performance data
                </p>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            {/* Header */}
            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Business Analytics</h1>
                    <p style={{
                        fontSize: '14px',
                        color: '#6b7280',
                        marginTop: '8px',
                        maxWidth: '600px'
                    }}>
                        Track your business performance, revenue trends, and customer insights
                    </p>
                </div>

                {/* Time Range Selector */}
                <div style={timeRangeStyle}>
                    {['daily', 'weekly', 'monthly', 'yearly'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            style={timeRangeButtonStyle(range)}
                            onMouseEnter={(e) => {
                                if (timeRange !== range) {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (timeRange !== range) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Overview Cards */}
            <div style={statsGridStyle}>
                {[
                    {
                        title: 'Total Revenue',
                        value: `₹${stats.totalSales.toLocaleString()}`,
                        color: '#3b82f6'
                    },
                    {
                        title: 'Total Orders',
                        value: stats.totalOrders.toLocaleString(),
                        color: '#10b981'
                    },
                    {
                        title: 'Avg. Order Value',
                        value: `₹${Math.round(stats.averageOrderValue).toLocaleString()}`,
                        color: '#8b5cf6'
                    }
                ].map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            ...statCardStyle,
                            borderLeftColor: stat.color
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <p style={{
                            fontSize: '14px',
                            color: '#6b7280',
                            marginBottom: '8px'
                        }}>
                            {stat.title}
                        </p>
                        <h2 style={{
                            fontSize: '32px',
                            fontWeight: '700',
                            color: '#1a202c'
                        }}>
                            {stat.value}
                        </h2>
                        <div style={{
                            fontSize: '12px',
                            color: '#059669',
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 6l-9.5 9.5-5-5L1 18" />
                                <path d="M17 6h6v6" />
                            </svg>
                            {index === 0 ? '+24% from last period' :
                                index === 1 ? '+18% from last period' :
                                    '+12% from last period'}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Area */}
            <div className="charts-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '24px',
                marginBottom: '24px'
            }}>
                {/* Revenue Trend Chart */}
                <div style={chartContainerStyle}>
                    <h3 style={chartTitleStyle}>Revenue Trend</h3>
                    <div style={chartWrapperStyle}>
                        <Line data={revenueData} options={chartOptions} />
                    </div>
                </div>

                {/* Order Volume Chart */}
                <div style={chartContainerStyle}>
                    <h3 style={chartTitleStyle}>Order Volume</h3>
                    <div style={chartWrapperStyle}>
                        <Bar data={ordersData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="bottom-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '24px'
            }}>
                {/* Doughnut Chart */}
                <div style={categoryBreakdownStyle}>
                    <h3 style={chartTitleStyle}>Top Categories</h3>
                    <div style={{ height: '260px', position: 'relative' }}>
                        <Doughnut data={categoryData} options={doughnutOptions} />
                    </div>
                </div>

                {/* Category Breakdown - Full width on mobile, 2/3 on desktop */}
                <div style={categoryBreakdownStyle} className="category-breakdown">
                    <h3 style={chartTitleStyle}>Category Breakdown</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {stats.topCategories.map((cat, index) => (
                            <div
                                key={index}
                                style={categoryItemStyle}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: categoryData.datasets[0].backgroundColor[index]
                                    }}></div>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: '#374151'
                                    }}>
                                        {cat.category}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '700',
                                        color: '#1a202c'
                                    }}>
                                        ₹{cat.revenue.toLocaleString()}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#6b7280',
                                        marginTop: '2px'
                                    }}>
                                        {cat.sales} sales
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid #f3f4f6',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px'
                    }}>
                        {stats.topCategories.map((cat, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                color: '#6b7280'
                            }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '2px',
                                    backgroundColor: categoryData.datasets[0].backgroundColor[index]
                                }}></div>
                                <span>{cat.category}: {((cat.revenue / stats.totalSales) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Stats */}
            <div style={{
                marginTop: '32px',
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                border: '1px solid #f3f4f6'
            }}>
                <h3 style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '16px'
                }}>
                    Performance Metrics
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '20px'
                }}>
                    {[
                        { label: 'Highest Revenue Day', value: `₹${Math.max(...stats.revenue).toLocaleString()}` },
                        { label: 'Lowest Revenue Day', value: `₹${Math.min(...stats.revenue.filter(v => v > 0)).toLocaleString()}` },
                        { label: 'Peak Orders', value: Math.max(...stats.orders) },
                        { label: 'Conversion Rate', value: '3.8%' }
                    ].map((metric, index) => (
                        <div key={index} style={{
                            textAlign: 'center',
                            padding: '16px',
                            backgroundColor: '#f9fafb',
                            borderRadius: '12px'
                        }}>
                            <div style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                marginBottom: '8px'
                            }}>
                                {metric.label}
                            </div>
                            <div style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                color: '#1a202c'
                            }}>
                                {metric.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CSS Animations and Media Queries */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @media (min-width: 1024px) {
                    .category-breakdown {
                        grid-column: span 2;
                    }
                }

                @media (max-width: 768px) {
                    .charts-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .bottom-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Analytics;