import { useState, useEffect } from 'react';

const Title = ({
    text1,
    text2,
    centered = false,
    showUnderline = true,
    underlineColor = '#374151',
    text1Color = '#6b7280',
    text2Color = '#1f2937',
    size = 'md',
    animation = false,
    icon = null
}) => {
    const [isVisible, setIsVisible] = useState(!animation);

    useEffect(() => {
        if (animation) {
            const timer = setTimeout(() => setIsVisible(true), 100);
            return () => clearTimeout(timer);
        }
    }, [animation]);

    // Size presets
    const sizeConfig = {
        sm: {
            fontSize: '1rem',
            gap: '0.25rem',
            marginBottom: '1rem',
            underlineWidth: '2rem',
            underlineHeight: '1px'
        },
        md: {
            fontSize: '1.5rem',
            gap: '0.5rem',
            marginBottom: '2rem',
            underlineWidth: '3rem',
            underlineHeight: '2px'
        },
        lg: {
            fontSize: '2rem',
            gap: '0.75rem',
            marginBottom: '2.5rem',
            underlineWidth: '4rem',
            underlineHeight: '3px'
        },
        xl: {
            fontSize: '2.5rem',
            gap: '1rem',
            marginBottom: '3rem',
            underlineWidth: '5rem',
            underlineHeight: '4px'
        }
    };

    const config = sizeConfig[size] || sizeConfig.md;

    return (
        <div
            style={{
                display: 'inline-flex',
                flexDirection: 'column',
                gap: config.gap,
                alignItems: centered ? 'center' : 'flex-start',
                marginBottom: config.marginBottom,
                width: '100%',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s ease-out',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: config.gap,
                    flexWrap: 'wrap',
                }}
            >
                {icon && (
                    <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        color: text2Color,
                        opacity: 0.8
                    }}>
                        {icon}
                    </span>
                )}
                <p
                    style={{
                        color: text1Color,
                        fontSize: config.fontSize,
                        fontWeight: 300,
                        textTransform: 'uppercase',
                        margin: 0,
                        letterSpacing: '1px',
                        lineHeight: 1.2,
                    }}
                >
                    {text1}{' '}
                    <span
                        style={{
                            color: text2Color,
                            fontWeight: 500,
                            position: 'relative',
                        }}
                    >
                        {text2}
                        {showUnderline && (
                            <span
                                style={{
                                    position: 'absolute',
                                    bottom: '-4px',
                                    left: 0,
                                    width: '100%',
                                    height: '2px',
                                    backgroundColor: underlineColor,
                                    opacity: 0.3,
                                    borderRadius: '1px',
                                }}
                            />
                        )}
                    </span>
                </p>
            </div>

            {showUnderline && (
                <div
                    style={{
                        width: config.underlineWidth,
                        height: config.underlineHeight,
                        backgroundColor: underlineColor,
                        margin: 0,
                        borderRadius: '1px',
                        opacity: 0.8,
                        transition: 'width 0.3s ease',
                    }}
                    className="title-underline"
                    onMouseEnter={(e) => {
                        if (animation) {
                            e.currentTarget.style.width = '100%';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (animation) {
                            e.currentTarget.style.width = config.underlineWidth;
                        }
                    }}
                />
            )}

            {/* Enhanced CSS for additional effects */}
            <style>{`
                @media (max-width: 768px) {
                    .title-underline {
                        width: ${parseInt(config.underlineWidth) * 0.75}px !important;
                    }
                }
                
                @media (max-width: 480px) {
                    .title-underline {
                        width: ${parseInt(config.underlineWidth) * 0.5}px !important;
                    }
                }
                
                .hover-grow {
                    transition: transform 0.3s ease;
                }
                
                .hover-grow:hover {
                    transform: scale(1.02);
                }
            `}</style>
        </div>
    );
};

// Alternative version with gradient text
export const GradientTitle = ({
    text1,
    text2,
    gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ...props
}) => {
    return (
        <Title
            text1={text1}
            text2={text2}
            text2Color="transparent"
            {...props}
            customText2={
                <span
                    style={{
                        background: gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 600,
                    }}
                >
                    {text2}
                </span>
            }
        />
    );
};

// Usage examples:
// 1. Basic:
// <Title text1="Admin" text2="Dashboard" />

// 2. With icon:
// <Title text1="Product" text2="Management" icon={<Package size={24} />} />

// 3. Centered with gradient:
// <GradientTitle text1="User" text2="Analytics" centered />

// 4. Large with animation:
// <Title text1="Sales" text2="Report" size="lg" animation />

export default Title;